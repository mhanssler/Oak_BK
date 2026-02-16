import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/auth/roles'
import { createCaseReference } from '@/lib/cases/case-ref'
import type { BankruptcyCase, CaseResponse } from '@/lib/cases/types'
import { buildTrusteeReadinessChecks, listBlockingReadinessGaps } from '@/lib/compliance/readiness'
import { readResponseField } from '@/lib/questionnaire/payload'
import { QUESTIONNAIRE_STEPS } from '@/lib/questionnaire/steps'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CHAPTER_OPTIONS = ['7', '13', '11', '12'] as const

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; text: string }> = {
  created: { tone: 'success', text: 'New case created.' },
  bad_case: { tone: 'error', text: 'Case title and chapter are required.' },
  create_failed: {
    tone: 'error',
    text: 'Unable to create the case right now. Please try again in a few seconds.',
  },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

function normalizeText(raw: FormDataEntryValue | null): string {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw.trim()
}

function buildDefaultCaseTitle(name: string): string {
  const base = name.trim().length > 0 ? name.trim() : 'Client'
  const today = new Date().toISOString().slice(0, 10)
  return `${base} - Intake ${today}`
}

function isMissingCaseRefColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false
  }
  const code = `${error.code || ''}`.toLowerCase()
  const message = `${error.message || ''}`.toLowerCase()
  return (
    code.includes('pgrst204') ||
    code.includes('42703') ||
    (message.includes('case_ref') && message.includes('column'))
  )
}

interface CaseProgressSummary {
  progressPercent: number
  blockingGapCount: number
  hasStarted: boolean
}

function summarizeCaseProgress(caseResponses: CaseResponse[]): CaseProgressSummary {
  const completedStepCount = QUESTIONNAIRE_STEPS.filter((step) =>
    caseResponses.some((response) => response.step_id === step.id && response.completed),
  ).length

  const progressPercent = Math.round((completedStepCount / QUESTIONNAIRE_STEPS.length) * 100)
  const readField = (fieldKey: string): unknown => readResponseField(caseResponses, fieldKey)
  const blockingGapCount = listBlockingReadinessGaps(buildTrusteeReadinessChecks(readField)).length

  return {
    progressPercent,
    blockingGapCount,
    hasStarted: caseResponses.length > 0,
  }
}

async function createCaseAction(formData: FormData) {
  'use server'

  await assertTrustedOrigin()
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const requestedTitle = normalizeText(formData.get('title')).slice(0, 120)
  const chapterSelection = normalizeText(formData.get('chapter'))
  const filingState = normalizeText(formData.get('filing_state')).slice(0, 64)
  const filingCounty = normalizeText(formData.get('filing_county')).slice(0, 64)
  const accountName = getUserDisplayName(user)
  const title = requestedTitle || buildDefaultCaseTitle(accountName || '')
  const chapter = CHAPTER_OPTIONS.includes(chapterSelection as (typeof CHAPTER_OPTIONS)[number])
    ? chapterSelection
    : '7'

  let createdCase: { id: string; case_ref: string | null } | null = null
  let insertError: { code?: string; message?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const caseRef = createCaseReference(accountName || title)
    const baseCaseInsert = {
      user_id: user.id,
      title,
      chapter,
      filing_state: filingState || null,
      filing_county: filingCounty || null,
    }

    const insertWithRefResult = await supabase
      .from('bankruptcy_cases')
      .insert({
        ...baseCaseInsert,
        case_ref: caseRef,
      })
      .select('id, case_ref')
      .single()

    if (!insertWithRefResult.error && insertWithRefResult.data) {
      createdCase = insertWithRefResult.data
      insertError = null
      break
    }

    if (isMissingCaseRefColumnError(insertWithRefResult.error)) {
      const insertWithoutRefResult = await supabase
        .from('bankruptcy_cases')
        .insert(baseCaseInsert)
        .select('id')
        .single()

      if (!insertWithoutRefResult.error && insertWithoutRefResult.data) {
        createdCase = {
          id: insertWithoutRefResult.data.id,
          case_ref: null,
        }
        insertError = null
      } else {
        insertError = {
          code: insertWithoutRefResult.error?.code,
          message: insertWithoutRefResult.error?.message,
        }
      }
      break
    }

    insertError = {
      code: insertWithRefResult.error?.code,
      message: insertWithRefResult.error?.message,
    }

    if (insertWithRefResult.error?.code !== '23505') {
      break
    }
  }

  if (insertError || !createdCase) {
    redirect('/dashboard?status=create_failed')
  }

  await supabase.from('case_audit_events').insert({
    case_id: createdCase.id,
    user_id: user.id,
    action: 'case_created',
    metadata: { source: 'dashboard', case_ref: createdCase.case_ref },
  })

  redirect(`/intake/${createdCase.id}?step=filing-plan&status=created`)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const statusCode = readSingle(resolvedSearchParams.status)
  const status = statusCode ? STATUS_MESSAGE[statusCode] : null

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: casesRaw } = await supabase
    .from('bankruptcy_cases')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const cases = ((casesRaw || []) as BankruptcyCase[]).filter((entry) => Boolean(entry.id))
  const caseIds = cases.map((entry) => entry.id)

  let caseResponses: CaseResponse[] = []
  if (caseIds.length > 0) {
    const { data: responsesRaw } = await supabase
      .from('case_responses')
      .select('case_id, step_id, payload, completed, updated_at')
      .in('case_id', caseIds)
    caseResponses = (responsesRaw || []) as CaseResponse[]
  }

  const responsesByCase = new Map<string, CaseResponse[]>()
  for (const response of caseResponses) {
    const existing = responsesByCase.get(response.case_id) || []
    existing.push(response)
    responsesByCase.set(response.case_id, existing)
  }

  return (
    <main>
      <section className="hero">
        <h1>My Cases</h1>
        <p>Start a case, complete each section, and submit your intake package for attorney review.</p>
      </section>

      <section className="surface" style={{ padding: '1.2rem', marginBottom: '1.2rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Create New Case</h2>
          {status ? (
            <div className={`alert ${status.tone === 'error' ? 'alert-error' : 'alert-success'}`}>
              {status.text}
            </div>
          ) : null}

          <form action={createCaseAction} className="stack">
            <div className="grid-two">
              <div className="field">
                <label htmlFor="title">Case title</label>
                <input id="title" name="title" required placeholder="Jane Doe - 2026 filing" />
              </div>
              <div className="field">
                <label htmlFor="chapter">Chapter</label>
                <select id="chapter" name="chapter" defaultValue="7" required>
                  <option value="7">Chapter 7</option>
                  <option value="13">Chapter 13</option>
                  <option value="11">Chapter 11</option>
                  <option value="12">Chapter 12</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="filing_state">State</label>
                <input id="filing_state" name="filing_state" placeholder="California" defaultValue="California" />
              </div>
              <div className="field">
                <label htmlFor="filing_county">County</label>
                <input id="filing_county" name="filing_county" placeholder="Alameda" />
              </div>
            </div>
            <div>
              <button className="button" type="submit">
                Start Intake
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="surface" style={{ padding: '1.2rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Existing Cases</h2>
          {cases.length === 0 ? (
            <p className="hint">No cases yet.</p>
          ) : (
            <div className="list-table-wrap">
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Case</th>
                    <th>Chapter</th>
                    <th>Progress</th>
                    <th>Readiness</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => {
                    const summary = summarizeCaseProgress(responsesByCase.get(caseItem.id) || [])
                    const readinessText = !summary.hasStarted
                      ? 'Not started'
                      : summary.blockingGapCount === 0
                        ? 'Ready'
                        : `${summary.blockingGapCount} blocker${summary.blockingGapCount === 1 ? '' : 's'}`

                    return (
                      <tr key={caseItem.id}>
                        <td>{caseItem.case_ref || caseItem.id}</td>
                        <td>{caseItem.title}</td>
                        <td>{caseItem.chapter}</td>
                        <td>{summary.progressPercent}%</td>
                        <td>{readinessText}</td>
                        <td>{caseItem.status}</td>
                        <td>{new Date(caseItem.updated_at).toLocaleString()}</td>
                        <td>
                          <div className="row">
                            <Link className="button-secondary" href={`/intake/${caseItem.id}`}>
                              Continue Intake
                            </Link>
                            <Link className="button-secondary" href={`/review/${caseItem.id}`}>
                              Review Packet
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
