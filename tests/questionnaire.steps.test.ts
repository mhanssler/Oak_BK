import {
  QUESTIONNAIRE_STEPS,
  getNextStepId,
  getPreviousStepId,
  getQuestionnaireStep,
} from '@/lib/questionnaire/steps'

describe('questionnaire step helpers', () => {
  it('returns the first step when step id is missing or invalid', () => {
    expect(getQuestionnaireStep(undefined).id).toBe(QUESTIONNAIRE_STEPS[0].id)
    expect(getQuestionnaireStep('does-not-exist').id).toBe(QUESTIONNAIRE_STEPS[0].id)
  })

  it('returns expected previous and next step ids', () => {
    const first = QUESTIONNAIRE_STEPS[0].id
    const second = QUESTIONNAIRE_STEPS[1].id
    const last = QUESTIONNAIRE_STEPS[QUESTIONNAIRE_STEPS.length - 1].id

    expect(getNextStepId(first)).toBe(second)
    expect(getPreviousStepId(first)).toBeNull()
    expect(getNextStepId(last)).toBeNull()
    expect(getPreviousStepId(second)).toBe(first)
  })

  it('has unique step ids', () => {
    const ids = QUESTIONNAIRE_STEPS.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
