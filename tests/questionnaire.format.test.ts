import { formatFieldValue } from '@/lib/questionnaire/format'
import { getQuestionnaireStep } from '@/lib/questionnaire/steps'

describe('questionnaire value formatting', () => {
  const filingPlan = getQuestionnaireStep('filing-plan')
  const chapterField = filingPlan.fields.find((field) => field.key === 'chapter')
  const consumerDebtField = filingPlan.fields.find(
    (field) => field.key === 'primarily_consumer_debts',
  )
  const countyField = filingPlan.fields.find((field) => field.key === 'filing_county')

  it('formats missing values as Not provided', () => {
    expect(formatFieldValue(countyField!, null)).toBe('Not provided')
  })

  it('formats boolean values', () => {
    expect(formatFieldValue(consumerDebtField!, true)).toBe('Yes')
    expect(formatFieldValue(consumerDebtField!, false)).toBe('No')
  })

  it('formats select values using labels', () => {
    expect(formatFieldValue(chapterField!, '7')).toBe('Chapter 7')
  })

  it('formats currency values', () => {
    const incomeField = getQuestionnaireStep('income-employment').fields.find(
      (field) => field.key === 'income_month_1',
    )
    expect(formatFieldValue(incomeField!, 1234.56)).toBe('$1,234.56')
  })
})
