import { z } from 'zod'
import { getNextStepId, getQuestionnaireStep, QUESTIONNAIRE_STEPS } from '@/lib/questionnaire/steps'
import { validateStepPayload } from '@/lib/questionnaire/validation'
import {
  buildHamishQuestionHints,
  hamishBehaviorProfile,
  hamishSystemPrompt,
} from '@/lib/hamish/behavior'

const chapterSchema = z.enum(['7', '11', '12', '13']).optional()

export const hamishAuthHeaderPrefix = 'Bearer '

export const hamishSchemaResponse = {
  steps: QUESTIONNAIRE_STEPS.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    fields: step.fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      placeholder: field.placeholder ?? null,
      helpText: field.helpText ?? null,
      options: field.options ?? [],
    })),
    questionHints: buildHamishQuestionHints(step),
  })),
  guidance: {
    role:
      'Hamish is an office intake professional, not a lawyer. He can explain process and gather facts, but he must not give legal advice or claim attorney authority.',
    writePolicy:
      'Persist only information supplied by the prospective client or clearly confirmed during the conversation. Do not invent answers.',
    systemPrompt: hamishSystemPrompt,
    behavior: hamishBehaviorProfile,
  },
}

export const hamishUpsertRequestSchema = z.object({
  caseId: z.string().uuid().optional(),
  caseRef: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  chapter: chapterSchema,
  filingState: z.string().trim().min(1).max(64).optional(),
  filingCounty: z.string().trim().min(1).max(64).optional(),
  contactName: z.string().trim().min(1).max(120).optional(),
  stepId: z.string().trim().min(1),
  answers: z.record(z.unknown()).default({}),
  markSubmitted: z.boolean().optional(),
})

export type HamishUpsertRequest = z.infer<typeof hamishUpsertRequestSchema>

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function buildHamishCaseTitle(input: {
  title?: string
  contactName?: string
}): string {
  if (input.title && input.title.trim().length > 0) {
    return input.title.trim().slice(0, 120)
  }

  if (input.contactName && input.contactName.trim().length > 0) {
    return `${input.contactName.trim().slice(0, 80)} - Hamish Intake ${todayIsoDate()}`.slice(0, 120)
  }

  return `Prospective Client - Hamish Intake ${todayIsoDate()}`
}

export function buildHamishResponseSummary(input: {
  stepId: string
  answers: Record<string, unknown>
}) {
  const step = getQuestionnaireStep(input.stepId)
  const validation = validateStepPayload(step, input.answers)
  return {
    step,
    validation,
    nextStepId: validation.completed ? getNextStepId(step.id) : step.id,
  }
}

export function isValidHamishBearer(headerValue: string | null, apiToken: string): boolean {
  if (!headerValue || !headerValue.startsWith(hamishAuthHeaderPrefix)) {
    return false
  }
  const token = headerValue.slice(hamishAuthHeaderPrefix.length).trim()
  return token.length > 0 && token === apiToken
}
