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
import { isAdminUser } from '@/lib/auth/roles'
import type { BankruptcyCase, CaseResponse } from '@/lib/cases/types'
import { formatFieldValue } from '@/lib/questionnaire/format'
import { getResponsePayload, readResponseField } from '@/lib/questionnaire/payload'
import { QUESTIONNAIRE_STEPS } from '@/lib/questionnaire/steps'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const { data: caseRaw } = await supabase
    .from('bankruptcy_cases')
    .select('*')
    .eq('id', caseId)
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

  const chapterRecommendation = recommendChapterFromIntake({
    selectedChapter: chapter,
    meansSummary,
    businessInterest: asBoolean(readField('business_interest')),
    securedDebtTotal: asNumber(readField('secured_debt_total')),
    ownsPrimaryResidence: asBoolean(readField('owns_primary_residence')),
  })

  const exemptionValue = readField('exemption_system')
  const exemptionSystem =
    typeof exemptionValue === 'string' ? CALIFORNIA_EXEMPTION_SYSTEMS[exemptionValue] : null

  return (
    <main>
      <section className="hero">
        <h1>Admin Case Detail</h1>
        <p>
          Case ID: {bankruptcyCase.case_ref || bankruptcyCase.id} | Owner: {bankruptcyCase.user_id}
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="stack" style={{ gap: '0.25rem' }}>
              <h2 style={{ margin: 0 }}>{bankruptcyCase.title}</h2>
              <span className="hint">
                Status: {bankruptcyCase.status} | Selected Chapter {bankruptcyCase.chapter}
              </span>
            </div>
            <Link className="button-secondary" href="/admin/cases">
              Back To Admin Cases
            </Link>
          </div>

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
                <strong>Screened Recommendation: {chapterRecommendation.label}</strong>
                <span className="hint">{chapterRecommendation.rationale}</span>
                <span className="hint">
                  Exemption system:{' '}
                  {exemptionSystem ? `${exemptionSystem.label} (${exemptionSystem.detail})` : 'Not selected'}
                </span>
              </div>
            </div>
          </div>
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
