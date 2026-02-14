import type { CaseResponse } from '@/lib/cases/types'
import { getResponsePayload, readResponseField } from '@/lib/questionnaire/payload'

function makeResponse(payload: unknown): CaseResponse {
  return {
    case_id: 'case-id',
    step_id: 'step-id',
    payload: payload as Record<string, unknown>,
    completed: false,
    updated_at: new Date().toISOString(),
  }
}

describe('questionnaire payload helpers', () => {
  it('returns empty object for missing or invalid payload values', () => {
    expect(getResponsePayload(undefined)).toEqual({})
    expect(getResponsePayload(makeResponse(null))).toEqual({})
    expect(getResponsePayload(makeResponse('bad-payload'))).toEqual({})
    expect(getResponsePayload(makeResponse(['bad']))).toEqual({})
  })

  it('returns object payload when payload is valid', () => {
    expect(getResponsePayload(makeResponse({ chapter: '7' }))).toEqual({ chapter: '7' })
  })

  it('reads fields from first matching response payload', () => {
    const responses: CaseResponse[] = [
      makeResponse('not-an-object'),
      makeResponse({ chapter: '13' }),
      makeResponse({ chapter: '7' }),
    ]

    expect(readResponseField(responses, 'chapter')).toBe('13')
    expect(readResponseField(responses, 'unknown_key')).toBeNull()
  })
})
