import { getQuestionnaireStep } from '@/lib/questionnaire/steps'
import { validateStepForm } from '@/lib/questionnaire/validation'

describe('questionnaire validation', () => {
  it('marks required fields missing', () => {
    const step = getQuestionnaireStep('filing-plan')
    const result = validateStepForm(step, new FormData())
    expect(result.completed).toBe(false)
    expect(result.missingRequiredFields.length).toBeGreaterThan(0)
  })

  it('parses numeric and boolean fields', () => {
    const step = getQuestionnaireStep('filing-plan')
    const formData = new FormData()
    formData.set('chapter', '7')
    formData.set('filing_state', 'California')
    formData.set('california_district', 'northern')
    formData.set('filing_county', 'Alameda')
    formData.set('primarily_consumer_debts', 'true')
    formData.set('exemption_system', '703')
    formData.set('disabled_veteran_means_test_exception', 'false')
    formData.set('active_military_means_test_exception', 'false')
    formData.set('urgent_deadline', 'false')

    const result = validateStepForm(step, formData)
    expect(result.completed).toBe(true)
    expect(result.payload.chapter).toBe('7')
    expect(result.payload.primarily_consumer_debts).toBe(true)
    expect(result.payload.urgent_deadline).toBe(false)
  })

  it('rejects invalid select values', () => {
    const step = getQuestionnaireStep('filing-plan')
    const formData = new FormData()
    formData.set('chapter', '99')
    formData.set('filing_state', 'CA')
    formData.set('california_district', 'northern')
    formData.set('filing_county', 'Alameda')
    formData.set('primarily_consumer_debts', 'true')
    formData.set('exemption_system', '703')
    formData.set('disabled_veteran_means_test_exception', 'false')
    formData.set('active_military_means_test_exception', 'false')
    formData.set('urgent_deadline', 'false')

    const result = validateStepForm(step, formData)
    expect(result.completed).toBe(false)
    expect(result.payload.chapter).toBeNull()
    expect(result.missingRequiredFields).toContain('chapter')
  })

  it('parses currency inputs and trims oversized text values', () => {
    const step = getQuestionnaireStep('income-employment')
    const formData = new FormData()
    formData.set('employment_status', 'employed')
    formData.set('income_month_1', '1,234.56')
    formData.set('income_month_2', '1200')
    formData.set('income_month_3', '1200')
    formData.set('income_month_4', '1200')
    formData.set('income_month_5', '1200')
    formData.set('income_month_6', '1200')
    formData.set('other_income', '100')
    formData.set('income_notes', 'a'.repeat(5000))

    const result = validateStepForm(step, formData)
    expect(result.payload.income_month_1).toBe(1234.56)
    expect(typeof result.payload.income_notes).toBe('string')
    expect((result.payload.income_notes as string).length).toBe(4000)
  })
})
