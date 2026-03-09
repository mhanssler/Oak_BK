import { type QuestionnaireField, type QuestionnaireStep } from '@/lib/questionnaire/steps'

const MAX_TEXT_LENGTH = 4000
const MAX_NUMERIC_VALUE = 1000000000

export interface StepValidationResult {
  payload: Record<string, unknown>
  missingRequiredFields: string[]
  completed: boolean
}

function normalizeText(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function sanitizeLongText(value: string): string {
  if (value.length <= MAX_TEXT_LENGTH) {
    return value
  }
  return value.slice(0, MAX_TEXT_LENGTH)
}

function parseNumeric(raw: string): number | null {
  if (!raw) {
    return null
  }

  const cleaned = raw.replace(/,/g, '')
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) {
    return null
  }

  if (Math.abs(parsed) > MAX_NUMERIC_VALUE) {
    return null
  }

  return Number(parsed.toFixed(2))
}

function normalizePayloadInput(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : ''
  }
  return ''
}

function parseFieldValue(field: QuestionnaireField, raw: string): unknown {
  if (!raw) {
    return null
  }

  if (field.type === 'number' || field.type === 'currency') {
    return parseNumeric(raw)
  }

  if (field.type === 'boolean') {
    if (raw === 'true') {
      return true
    }
    if (raw === 'false') {
      return false
    }
    return null
  }

  if (field.type === 'select') {
    const allowedValues = new Set((field.options || []).map((option) => option.value))
    return allowedValues.has(raw) ? raw : null
  }

  return sanitizeLongText(raw)
}

function isMissingRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }
  if (typeof value === 'string') {
    return value.trim().length === 0
  }
  return false
}

export function validateStepForm(
  step: QuestionnaireStep,
  formData: FormData,
): StepValidationResult {
  const payload: Record<string, unknown> = {}
  const missingRequiredFields: string[] = []

  for (const field of step.fields) {
    const rawText = normalizeText(formData.get(field.key))
    const parsedValue = parseFieldValue(field, rawText)
    payload[field.key] = parsedValue

    if (field.required && isMissingRequired(parsedValue)) {
      missingRequiredFields.push(field.key)
    }
  }

  return {
    payload,
    missingRequiredFields,
    completed: missingRequiredFields.length === 0,
  }
}


export function validateStepPayload(
  step: QuestionnaireStep,
  values: Record<string, unknown>,
): StepValidationResult {
  const payload: Record<string, unknown> = {}
  const missingRequiredFields: string[] = []

  for (const field of step.fields) {
    const rawText = normalizePayloadInput(values[field.key])
    const parsedValue = parseFieldValue(field, rawText)
    payload[field.key] = parsedValue

    if (field.required && isMissingRequired(parsedValue)) {
      missingRequiredFields.push(field.key)
    }
  }

  return {
    payload,
    missingRequiredFields,
    completed: missingRequiredFields.length === 0,
  }
}
