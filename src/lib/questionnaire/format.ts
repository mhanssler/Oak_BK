import { type QuestionnaireField } from '@/lib/questionnaire/steps'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatFieldValue(field: QuestionnaireField, value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided'
  }

  if (field.type === 'boolean') {
    return value === true ? 'Yes' : value === false ? 'No' : 'Not provided'
  }

  if ((field.type === 'currency' || field.type === 'number') && typeof value === 'number') {
    return field.type === 'currency' ? formatCurrency(value) : String(value)
  }

  if (field.type === 'select') {
    const selectedOption = field.options?.find((option) => option.value === value)
    return selectedOption?.label || String(value)
  }

  return String(value)
}
