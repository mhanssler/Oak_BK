import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  CALIFORNIA_EXEMPTION_SYSTEMS,
  asBoolean,
  asNumber,
  formatUsd,
  summarizeCaliforniaMeansTest,
} from '@/lib/bankruptcy/california'
import type { BankruptcyCase, CaseResponse } from '@/lib/cases/types'
import { formatFieldValue } from '@/lib/questionnaire/format'
import { QUESTIONNAIRE_STEPS } from '@/lib/questionnaire/steps'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type SearchParams = {
  status?: string | string[]
}

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; text: string }> = {
  submitted: { tone: 'success', text: 'Case marked submitted for attorney review.' },
  submit_blocked: {
    tone: 'error',
    text: 'Cannot submit yet. Complete all required intake steps first.',
  },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

async function submitCaseAction(formData: FormData) {
  'use server'

  assertTrustedOrigin()
  const caseIdValue = formData.get('caseId')
  const caseId = typeof caseIdValue === 'string' ? caseIdValue : ''

  if (!caseId) {
    redirect('/dashboard')
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: caseRow } = await supabase
    .from('bankruptcy_cases')
    .select('id, user_id')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!caseRow) {
    redirect('/dashboard')
  }

  const { data: responsesRaw } = await supabase
    .from('case_responses')
    .select('step_id, completed')
    .eq('case_id', caseId)

  const completionMap = new Map<string, boolean>(
    (responsesRaw || []).map((row) => [row.step_id as string, Boolean(row.completed)]),
  )
  const hasMissingStep = QUESTIONNAIRE_STEPS.some((step) => !completionMap.get(step.id))

  if (hasMissingStep) {
    redirect(`/review/${caseId}?status=submit_blocked`)
  }

  await supabase
    .from('bankruptcy_cases')
    .update({ status: 'submitted' })
    .eq('id', caseId)
    .eq('user_id', user.id)

  await supabase.from('case_audit_events').insert({
    case_id: caseId,
    user_id: user.id,
    action: 'case_submitted',
    metadata: { destination: 'attorney_review' },
  })

  redirect(`/review/${caseId}?status=submitted`)
}

export default async function ReviewCasePage({
  params,
  searchParams,
}: {
  params: { caseId: string }
  searchParams: SearchParams
}) {
  const caseId = params.caseId
  const statusCode = readSingle(searchParams.status)
  const status = statusCode ? STATUS_MESSAGE[statusCode] : null

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: caseRaw } = await supabase
    .from('bankruptcy_cases')
    .select('*')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!caseRaw) {
    notFound()
  }

  const bankruptcyCase = caseRaw as BankruptcyCase

  const { data: responsesRaw } = await supabase
    .from('case_responses')
    .select('case_id, step_id, payload, completed, updated_at')
    .eq('case_id', caseId)

  const responses = (responsesRaw || []) as CaseResponse[]
  const responseMap = new Map<string, CaseResponse>(responses.map((entry) => [entry.step_id, entry]))
  const missingSteps = QUESTIONNAIRE_STEPS.filter((step) => !responseMap.get(step.id)?.completed)

  const readField = (fieldKey: string): unknown => {
    for (const response of responses) {
      const payload = response.payload as Record<string, unknown>
      if (fieldKey in payload) {
        return payload[fieldKey]
      }
    }
    return null
  }

  const chapterFromPayload = readField('chapter')
  const chapter =
    typeof chapterFromPayload === 'string' && chapterFromPayload.length > 0
      ? chapterFromPayload
      : bankruptcyCase.chapter

  const meansSummary = summarizeCaliforniaMeansTest({
    chapter,
    householdSize: asNumber(readField('household_size')),
    monthlyIncomeHistory: [
      asNumber(readField('income_month_1')),
      asNumber(readField('income_month_2')),
      asNumber(readField('income_month_3')),
      asNumber(readField('income_month_4')),
      asNumber(readField('income_month_5')),
      asNumber(readField('income_month_6')),
    ].filter((value): value is number => value !== null),
    primarilyConsumerDebts: asBoolean(readField('primarily_consumer_debts')),
    disabledVeteranException: asBoolean(readField('disabled_veteran_means_test_exception')),
    activeMilitaryException: asBoolean(readField('active_military_means_test_exception')),
  })

  const exemptionValue = readField('exemption_system')
  const exemptionSystem =
    typeof exemptionValue === 'string' ? CALIFORNIA_EXEMPTION_SYSTEMS[exemptionValue] : null

  const complianceChecks = [
    {
      label: 'Pre-filing credit counseling complete',
      done: asBoolean(readField('credit_counseling_completed')) === true,
    },
    {
      label: 'Credit counseling certificate ready',
      done: asBoolean(readField('credit_counseling_certificate_ready')) === true,
    },
    {
      label: '341 attendance acknowledgment',
      done: asBoolean(readField('attend_341_meeting_acknowledged')) === true,
    },
    {
      label: 'FCRA credit-pull authorization',
      done: asBoolean(readField('authorized_credit_pull')) === true,
    },
  ]
  const incompleteCompliance = complianceChecks.filter((item) => !item.done)

  return (
    <main>
      <section className="hero">
        <h1>Review Packet</h1>
        <p>
          Confirm every section before attorney submission. Missing required steps block final
          submission.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          {status ? (
            <div className={`alert ${status.tone === 'error' ? 'alert-error' : 'alert-success'}`}>
              {status.text}
            </div>
          ) : null}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="stack" style={{ gap: '0.3rem' }}>
              <h2 style={{ margin: 0 }}>{bankruptcyCase.title}</h2>
              <span className="hint">
                Status: {bankruptcyCase.status} | Chapter {bankruptcyCase.chapter}
              </span>
            </div>
            <div className="row">
              <Link className="button-secondary" href={`/intake/${caseId}`}>
                Back To Intake
              </Link>
              <Link className="button-secondary" href={`/review/${caseId}/packet`}>
                Download Packet JSON
              </Link>
            </div>
          </div>

          {missingSteps.length > 0 ? (
            <div className="alert alert-error">
              Missing required steps: {missingSteps.map((step) => step.title).join(', ')}
            </div>
          ) : (
            <div className="alert alert-success">All steps complete. Ready for legal review.</div>
          )}

          <div className="grid-two">
            <div className="surface" style={{ padding: '0.8rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>{meansSummary.title}</strong>
                <span className="hint">{meansSummary.detail}</span>
                <span className="hint">
                  Annualized income: {formatUsd(meansSummary.annualizedIncome)} | California median:{' '}
                  {formatUsd(meansSummary.medianThreshold)}
                </span>
              </div>
            </div>

            <div className="surface" style={{ padding: '0.8rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>Exemptions And Compliance</strong>
                <span className="hint">
                  Exemption system:{' '}
                  {exemptionSystem ? `${exemptionSystem.label} (${exemptionSystem.detail})` : 'Not selected'}
                </span>
                {incompleteCompliance.length > 0 ? (
                  <span className="hint">
                    Missing compliance checkpoints: {incompleteCompliance.map((item) => item.label).join(', ')}
                  </span>
                ) : (
                  <span className="hint">Core counseling/authorization checkpoints are complete.</span>
                )}
              </div>
            </div>
          </div>

          <form action={submitCaseAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <button className="button" type="submit" disabled={missingSteps.length > 0}>
              Mark Submitted For Attorney Review
            </button>
          </form>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem' }}>
        <div className="stack">
          {QUESTIONNAIRE_STEPS.map((step) => {
            const response = responseMap.get(step.id)
            const payload = (response?.payload || {}) as Record<string, unknown>
            return (
              <article key={step.id} style={{ borderBottom: '1px solid #dce8e5', paddingBottom: '1rem' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ marginBottom: '0.35rem' }}>{step.title}</h3>
                  <span className="hint">{response?.completed ? 'Complete' : 'Incomplete'}</span>
                </div>
                <dl style={{ margin: 0 }}>
                  {step.fields.map((field) => (
                    <div className="kv" key={field.key}>
                      <dt>{field.label}</dt>
                      <dd>{formatFieldValue(field, payload[field.key])}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
