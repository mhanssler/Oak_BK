import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/auth/roles'
import { createCaseReference } from '@/lib/cases/case-ref'
import type { BankruptcyCase } from '@/lib/cases/types'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CHAPTER_OPTIONS = ['7', '13', '11', '12'] as const

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; text: string }> = {
  created: { tone: 'success', text: 'New case created.' },
  bad_case: { tone: 'error', text: 'Case title and chapter are required.' },
  create_failed: { tone: 'error', text: 'Unable to create case. Try again.' },
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

async function createCaseAction(formData: FormData) {
  'use server'

  assertTrustedOrigin()
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = normalizeText(formData.get('title')).slice(0, 120)
  const chapter = normalizeText(formData.get('chapter'))
  const filingState = normalizeText(formData.get('filing_state')).slice(0, 64)
  const filingCounty = normalizeText(formData.get('filing_county')).slice(0, 64)
  const accountName = getUserDisplayName(user)

  if (!title || !CHAPTER_OPTIONS.includes(chapter as (typeof CHAPTER_OPTIONS)[number])) {
    redirect('/dashboard?status=bad_case')
  }

  let createdCase: { id: string; case_ref: string } | null = null
  let insertError: { code?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const caseRef = createCaseReference(accountName || title)
    const insertResult = await supabase
      .from('bankruptcy_cases')
      .insert({
        user_id: user.id,
        case_ref: caseRef,
        title,
        chapter,
        filing_state: filingState || null,
        filing_county: filingCounty || null,
      })
      .select('id, case_ref')
      .single()

    if (!insertResult.error && insertResult.data) {
      createdCase = insertResult.data
      insertError = null
      break
    }

    insertError = { code: insertResult.error?.code }
    if (insertResult.error?.code !== '23505') {
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
  searchParams: { status?: string | string[] }
}) {
  const statusCode = readSingle(searchParams.status)
  const status = statusCode ? STATUS_MESSAGE[statusCode] : null

  const supabase = createSupabaseServerClient()
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
            <table className="list-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Case</th>
                  <th>Chapter</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>{caseItem.case_ref || caseItem.id}</td>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.chapter}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  )
}
