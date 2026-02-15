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
import type { BankruptcyCase, CaseResponse } from '@/lib/cases/types'
import {
  QUESTIONNAIRE_STEPS,
  getNextStepId,
  getPreviousStepId,
  getQuestionnaireStep,
  type QuestionnaireField,
} from '@/lib/questionnaire/steps'
import { getResponsePayload, readResponseField } from '@/lib/questionnaire/payload'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateStepForm } from '@/lib/questionnaire/validation'

type SearchParams = {
  step?: string | string[]
  status?: string | string[]
}

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; text: string }> = {
  created: { tone: 'success', text: 'Case created. Start completing each section below.' },
  saved: { tone: 'success', text: 'Draft saved.' },
  missing_required: {
    tone: 'error',
    text: 'Complete all required questions in this step before moving forward.',
  },
  invalid_step: { tone: 'error', text: 'Invalid step selected. Showing the first step.' },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

function toInputValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}

function toIntakePath(caseId: string, stepId: string, status: string): string {
  const params = new URLSearchParams()
  params.set('step', stepId)
  params.set('status', status)
  return `/intake/${caseId}?${params.toString()}`
}

function fieldInputType(field: QuestionnaireField): 'text' | 'number' | 'date' {
  if (field.type === 'number' || field.type === 'currency') {
    return 'number'
  }
  if (field.type === 'date') {
    return 'date'
  }
  return 'text'
}

function normalizeIntent(raw: FormDataEntryValue | null): 'previous' | 'save' | 'next' {
  if (raw === 'previous' || raw === 'save' || raw === 'next') {
    return raw
  }
  return 'save'
}

async function saveStepAction(formData: FormData) {
  'use server'

  await assertTrustedOrigin()

  const caseIdEntry = formData.get('caseId')
  const stepIdEntry = formData.get('stepId')
  const caseId = typeof caseIdEntry === 'string' ? caseIdEntry : ''
  const rawStepId = typeof stepIdEntry === 'string' ? stepIdEntry : ''
  const intent = normalizeIntent(formData.get('intent'))

  if (!caseId || !rawStepId) {
    redirect('/dashboard')
  }

  const step = getQuestionnaireStep(rawStepId)
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

  const validation = validateStepForm(step, formData)
  await supabase.from('case_responses').upsert(
    {
      case_id: caseId,
      step_id: step.id,
      payload: validation.payload,
      completed: validation.completed,
    },
    { onConflict: 'case_id,step_id' },
  )

  if (step.id === 'filing-plan') {
    const chapter = typeof validation.payload.chapter === 'string' ? validation.payload.chapter : null
    const filingState =
      typeof validation.payload.filing_state === 'string' ? validation.payload.filing_state : null
    const filingCounty =
      typeof validation.payload.filing_county === 'string'
        ? validation.payload.filing_county
        : null

    await supabase
      .from('bankruptcy_cases')
      .update({
        chapter: chapter || undefined,
        filing_state: filingState || undefined,
        filing_county: filingCounty || undefined,
      })
      .eq('id', caseId)
      .eq('user_id', user.id)
  }

  await supabase.from('case_audit_events').insert({
    case_id: caseId,
    user_id: user.id,
    action: 'step_saved',
    metadata: {
      step_id: step.id,
      completed: validation.completed,
      missing_required_count: validation.missingRequiredFields.length,
      intent,
    },
  })

  if (intent === 'previous') {
    const previousStepId = getPreviousStepId(step.id)
    if (!previousStepId) {
      redirect(toIntakePath(caseId, step.id, 'saved'))
    }
    redirect(toIntakePath(caseId, previousStepId, 'saved'))
  }

  if (intent === 'next') {
    if (validation.missingRequiredFields.length > 0) {
      redirect(toIntakePath(caseId, step.id, 'missing_required'))
    }

    const nextStepId = getNextStepId(step.id)
    if (nextStepId) {
      redirect(toIntakePath(caseId, nextStepId, 'saved'))
    }

    redirect(`/review/${caseId}`)
  }

  redirect(toIntakePath(caseId, step.id, 'saved'))
}

export default async function IntakeCasePage({
  params,
  searchParams,
}: {
  params: { caseId: string }
  searchParams: SearchParams
}) {
  const caseId = params.caseId
  const statusCode = readSingle(searchParams.status)
  const status = statusCode ? STATUS_MESSAGE[statusCode] : null

  const requestedStep = readSingle(searchParams.step)
  const step = getQuestionnaireStep(requestedStep)

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
  const currentPayload = getResponsePayload(responseMap.get(step.id))
  const completedCount = QUESTIONNAIRE_STEPS.filter((item) => responseMap.get(item.id)?.completed).length
  const progress = Math.round((completedCount / QUESTIONNAIRE_STEPS.length) * 100)

  const readField = (fieldKey: string): unknown => readResponseField(responses, fieldKey)

  const chapterFromPayload = readField('chapter')
  const chapter =
    typeof chapterFromPayload === 'string' && chapterFromPayload.length > 0
      ? chapterFromPayload
      : bankruptcyCase.chapter

  const householdSize = asNumber(readField('household_size'))
  const primarilyConsumerDebts = asBoolean(readField('primarily_consumer_debts'))
  const disabledVeteranException = asBoolean(readField('disabled_veteran_means_test_exception'))
  const activeMilitaryException = asBoolean(readField('active_military_means_test_exception'))

  const incomeFieldKeys = [
    'income_month_1',
    'income_month_2',
    'income_month_3',
    'income_month_4',
    'income_month_5',
    'income_month_6',
  ]
  const monthlyIncomeHistory = incomeFieldKeys
    .map((key) => asNumber(readField(key)))
    .filter((value): value is number => value !== null)

  const meansSummary = summarizeCaliforniaMeansTest({
    chapter,
    householdSize,
    monthlyIncomeHistory,
    primarilyConsumerDebts,
    disabledVeteranException,
    activeMilitaryException,
  })

  const selectedExemption = readField('exemption_system')
  const exemptionSystem =
    typeof selectedExemption === 'string' ? CALIFORNIA_EXEMPTION_SYSTEMS[selectedExemption] : null

  const chapterRecommendation = recommendChapterFromIntake({
    selectedChapter: chapter,
    meansSummary,
    businessInterest: asBoolean(readField('business_interest')),
    securedDebtTotal: asNumber(readField('secured_debt_total')),
    ownsPrimaryResidence: asBoolean(readField('owns_primary_residence')),
  })

  return (
    <main>
      <section className="hero">
        <h1>{bankruptcyCase.title}</h1>
        <p>
          Case ID: {bankruptcyCase.case_ref || bankruptcyCase.id}. Complete each section and we will
          screen the likely chapter path for attorney review.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          {status ? (
            <div className={`alert ${status.tone === 'error' ? 'alert-error' : 'alert-success'}`}>
              {status.text}
            </div>
          ) : null}

          <div className="stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>
                Step {QUESTIONNAIRE_STEPS.findIndex((item) => item.id === step.id) + 1} of{' '}
                {QUESTIONNAIRE_STEPS.length}
              </strong>
              <span className="hint">{progress}% complete</span>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <nav className="step-nav" aria-label="Questionnaire steps">
              {QUESTIONNAIRE_STEPS.map((item) => {
                const complete = responseMap.get(item.id)?.completed
                const isActive = item.id === step.id
                const label = `${item.title}${complete ? ' - Complete' : ''}`
                return (
                  <Link
                    key={item.id}
                    href={`/intake/${caseId}?step=${item.id}`}
                    className={`step-pill ${isActive ? 'step-pill-active' : ''}`}
                    title={label}
                  >
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="grid-two">
            <div className="surface" style={{ padding: '0.75rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>{meansSummary.title}</strong>
                <span className="hint">{meansSummary.detail}</span>
                <span className="hint">
                  Annualized income: {formatUsd(meansSummary.annualizedIncome)} | California median:{' '}
                  {formatUsd(meansSummary.medianThreshold)}
                </span>
              </div>
            </div>
            <div className="surface" style={{ padding: '0.75rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>California Exemption Selection</strong>
                {exemptionSystem ? (
                  <>
                    <span className="hint">
                      {exemptionSystem.label}: {exemptionSystem.detail}
                    </span>
                    <span className="hint">{exemptionSystem.whenUsuallyUsed}</span>
                  </>
                ) : (
                  <span className="hint">
                    Select exemption system in Filing Plan step (California does not allow federal
                    exemptions).
                  </span>
                )}
              </div>
            </div>
            <div className="surface" style={{ padding: '0.75rem' }}>
              <div className="stack" style={{ gap: '0.35rem' }}>
                <strong>Screened Chapter Recommendation: {chapterRecommendation.label}</strong>
                <span className="hint">{chapterRecommendation.rationale}</span>
                <span className="hint">
                  Recommendation is automated screening only. Final chapter determination is made by
                  your attorney.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem' }}>
        <form action={saveStepAction} className="stack">
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="stepId" value={step.id} />

          <div>
            <h2 style={{ margin: '0 0 0.3rem' }}>{step.title}</h2>
            <p className="hint" style={{ marginTop: 0 }}>
              {step.description}
            </p>
          </div>

          {step.fields.map((field) => {
            const defaultValue = toInputValue(currentPayload[field.key])

            if (field.type === 'textarea') {
              return (
                <div className="field" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <textarea
                    id={field.key}
                    name={field.key}
                    defaultValue={defaultValue}
                    required={Boolean(field.required)}
                    placeholder={field.placeholder}
                  />
                  {field.helpText ? <span className="hint">{field.helpText}</span> : null}
                </div>
              )
            }

            if (field.type === 'select') {
              return (
                <div className="field" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={defaultValue}
                    required={Boolean(field.required)}
                  >
                    <option value="">Select</option>
                    {(field.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {field.helpText ? <span className="hint">{field.helpText}</span> : null}
                </div>
              )
            }

            if (field.type === 'boolean') {
              return (
                <div className="field" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={defaultValue}
                    required={Boolean(field.required)}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  {field.helpText ? <span className="hint">{field.helpText}</span> : null}
                </div>
              )
            }

            return (
              <div className="field" key={field.key}>
                <label htmlFor={field.key}>
                  {field.label}
                  {field.required ? ' *' : ''}
                </label>
                <input
                  id={field.key}
                  name={field.key}
                  type={fieldInputType(field)}
                  step={field.type === 'currency' ? '0.01' : undefined}
                  defaultValue={defaultValue}
                  required={Boolean(field.required)}
                  placeholder={field.placeholder}
                />
                {field.helpText ? <span className="hint">{field.helpText}</span> : null}
              </div>
            )
          })}

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <button
                className="button-secondary"
                type="submit"
                name="intent"
                value="previous"
                disabled={!getPreviousStepId(step.id)}
              >
                Previous
              </button>
              <button className="button-secondary" type="submit" name="intent" value="save">
                Save Draft
              </button>
            </div>
            <div className="row">
              <Link className="button-secondary" href={`/review/${caseId}`}>
                Review Packet
              </Link>
              <button className="button" type="submit" name="intent" value="next">
                {getNextStepId(step.id) ? 'Next Step' : 'Finish Intake'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

