import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  CALIFORNIA_EXEMPTION_SYSTEMS,
  asBoolean,
  asNumber,
  formatUsd,
  recommendChapterFromIntake,
  summarizeCaliforniaMeansTest,
} from '@/lib/bankruptcy/california'
import {
  TRUSTEE_RESOURCE_LINKS,
  buildTrusteeReadinessChecks,
  listBlockingReadinessGaps,
  toHttpUrl,
} from '@/lib/compliance/readiness'
import type { BankruptcyCase, CaseResponse } from '@/lib/cases/types'
import { formatFieldValue } from '@/lib/questionnaire/format'
import { getResponsePayload, readResponseField } from '@/lib/questionnaire/payload'
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
  submit_blocked_readiness: {
    tone: 'error',
    text: 'Cannot submit yet. Resolve all trustee-readiness blockers first.',
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

  await assertTrustedOrigin()
  const caseIdValue = formData.get('caseId')
  const caseId = typeof caseIdValue === 'string' ? caseIdValue : ''

  if (!caseId) {
    redirect('/dashboard')
  }

  const supabase = await createSupabaseServerClient()
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
    .select('step_id, completed, payload')
    .eq('case_id', caseId)

  const completionMap = new Map<string, boolean>(
    (responsesRaw || []).map((row) => [row.step_id as string, Boolean(row.completed)]),
  )
  const hasMissingStep = QUESTIONNAIRE_STEPS.some((step) => !completionMap.get(step.id))
  const readinessReadField = (fieldKey: string): unknown =>
    readResponseField((responsesRaw || []) as Array<{ payload: unknown }>, fieldKey)
  const blockingReadinessGaps = listBlockingReadinessGaps(
    buildTrusteeReadinessChecks(readinessReadField),
  )

  if (hasMissingStep) {
    redirect(`/review/${caseId}?status=submit_blocked`)
  }

  if (blockingReadinessGaps.length > 0) {
    redirect(`/review/${caseId}?status=submit_blocked_readiness`)
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
  params: Promise<{ caseId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { caseId } = await params
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

  const readField = (fieldKey: string): unknown => readResponseField(responses, fieldKey)

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

  const chapterRecommendation = recommendChapterFromIntake({
    selectedChapter: chapter,
    meansSummary,
    businessInterest: asBoolean(readField('business_interest')),
    securedDebtTotal: asNumber(readField('secured_debt_total')),
    ownsPrimaryResidence: asBoolean(readField('owns_primary_residence')),
  })

  const readinessChecks = buildTrusteeReadinessChecks(readField)
  const blockingReadinessGaps = listBlockingReadinessGaps(readinessChecks)
  const incompleteReadiness = readinessChecks.filter((item) => !item.done)
  const section341MeetingLink = toHttpUrl(readField('meeting_341_join_link'))

  return (
    <main>
      <section className="hero">
        <h1>Review Packet</h1>
        <p>
          Confirm your answers before legal-team submission. Missing required steps block final
          completion.
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
                Case ID: {bankruptcyCase.case_ref || bankruptcyCase.id} | Status: {bankruptcyCase.status} | Selected Chapter{' '}
                {bankruptcyCase.chapter}
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

          {blockingReadinessGaps.length > 0 ? (
            <div className="alert alert-error">
              Trustee-readiness blockers: {blockingReadinessGaps.join(', ')}
            </div>
          ) : (
            <div className="alert alert-success">
              Trustee-readiness blockers cleared. Submission controls are unlocked.
            </div>
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
                <strong>Exemptions, Counseling, And Trustee Readiness</strong>
                <span className="hint">
                  Exemption system:{' '}
                  {exemptionSystem ? `${exemptionSystem.label} (${exemptionSystem.detail})` : 'Not selected'}
                </span>
                {incompleteReadiness.length > 0 ? (
                  <span className="hint">
                    Outstanding checkpoints: {incompleteReadiness.map((item) => item.label).join(', ')}
                  </span>
                ) : (
                  <span className="hint">Core counseling/credit/trustee checkpoints are complete.</span>
                )}
                <div className="row">
                  <Link className="hint" href={TRUSTEE_RESOURCE_LINKS.creditCounseling} target="_blank" rel="noreferrer">
                    Approved pre-filing counseling providers
                  </Link>
                  <Link className="hint" href={TRUSTEE_RESOURCE_LINKS.debtorEducation} target="_blank" rel="noreferrer">
                    Approved post-filing debtor education providers
                  </Link>
                </div>
              </div>
            </div>
            <div className="surface" style={{ padding: '0.8rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>Screened Chapter Recommendation: {chapterRecommendation.label}</strong>
                <span className="hint">{chapterRecommendation.rationale}</span>
                <span className="hint">
                  Automated recommendation only. Your attorney determines the final chapter strategy.
                </span>
              </div>
            </div>
            <div className="surface" style={{ padding: '0.8rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>Court ECM/CM-ECF + 341(a) Hearing</strong>
                <span className="hint">
                  ECM/CM-ECF workflow reviewed:{' '}
                  {asBoolean(readField('cm_ecf_workflow_reviewed')) === true ? 'Yes' : 'No'}
                </span>
                <span className="hint">
                  341(a) platform:{' '}
                  {typeof readField('meeting_341_platform') === 'string'
                    ? String(readField('meeting_341_platform'))
                    : 'Not selected'}
                </span>
                {section341MeetingLink ? (
                  <Link className="hint" href={section341MeetingLink} target="_blank" rel="noreferrer">
                    Open 341(a) meeting link
                  </Link>
                ) : (
                  <span className="hint">341(a) join link not entered yet.</span>
                )}
                <div className="row">
                  <Link className="hint" href={TRUSTEE_RESOURCE_LINKS.cmEcf} target="_blank" rel="noreferrer">
                    CM/ECF process reference
                  </Link>
                  <Link className="hint" href={TRUSTEE_RESOURCE_LINKS.section341Meetings} target="_blank" rel="noreferrer">
                    Official 341(a) meeting resources
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: '0.8rem' }}>
            <div className="stack" style={{ gap: '0.35rem' }}>
              <strong>Trustee-Readiness Checklist</strong>
              <ul className="process-list" style={{ marginTop: 0, marginBottom: 0 }}>
                {readinessChecks.map((check) => (
                  <li key={check.key}>
                    {check.done ? 'Complete' : 'Pending'}: {check.label}
                    {check.helpHref ? (
                      <>
                        {' '}
                        (
                        <Link className="hint" href={check.helpHref} target="_blank" rel="noreferrer">
                          official reference
                        </Link>
                        )
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form action={submitCaseAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <button
              className="button"
              type="submit"
              disabled={missingSteps.length > 0 || blockingReadinessGaps.length > 0}
            >
              Mark Submitted For Attorney Review
            </button>
          </form>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem' }}>
        <div className="stack">
          {QUESTIONNAIRE_STEPS.map((step) => {
            const response = responseMap.get(step.id)
            const payload = getResponsePayload(response)
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

