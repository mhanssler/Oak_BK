const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
  createSupabaseServiceRoleClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/service-role', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

vi.mock('@/lib/hamish/config', () => ({
  getHamishConfig: () => ({
    apiToken: 'hamish-secret',
    officeOwnerUserId: '00000000-0000-0000-0000-000000000123',
    serviceRoleKey: 'service-role-placeholder',
  }),
}))

import { GET, POST } from '@/app/api/hamish/intake/route'

describe('hamish intake route', () => {
  beforeEach(() => {
    createSupabaseServiceRoleClientMock.mockReset()
  })

  it('rejects unauthorized requests', async () => {
    const response = await GET(new Request('https://oak.example.com/api/hamish/intake'))
    expect(response.status).toBe(401)
  })

  it('returns questionnaire schema for authorized requests', async () => {
    const response = await GET(
      new Request('https://oak.example.com/api/hamish/intake', {
        headers: { authorization: 'Bearer hamish-secret' },
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.steps)).toBe(true)
    expect(body.steps[0].id).toBe('filing-plan')
    expect(Array.isArray(body.steps[0].questionHints)).toBe(true)
    expect(body.guidance.behavior.agentName).toBe('Hamish')
    expect(body.guidance.systemPrompt).toContain('You are Hamish')
    expect(body.guidance.systemPrompt).toContain('not a lawyer')
  })

  it('creates or updates a case step through the service-role client', async () => {
    const bankruptcyCasesSelectEqMaybeSingle = vi.fn().mockResolvedValue({ data: null })
    const bankruptcyCasesSelectEq = vi.fn().mockReturnValue({ maybeSingle: bankruptcyCasesSelectEqMaybeSingle })
    const bankruptcyCasesSelect = vi.fn().mockReturnValue({ eq: bankruptcyCasesSelectEq })
    const bankruptcyCasesInsertSingle = vi.fn().mockResolvedValue({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        case_ref: 'case-hamish',
        chapter: '7',
        filing_state: 'California',
        filing_county: 'Alameda',
        status: 'draft',
      },
      error: null,
    })
    const bankruptcyCasesInsertSelect = vi.fn().mockReturnValue({ single: bankruptcyCasesInsertSingle })
    const bankruptcyCasesInsert = vi.fn().mockReturnValue({ select: bankruptcyCasesInsertSelect })
    const bankruptcyCasesUpdateEq = vi.fn().mockResolvedValue({ error: null })
    const bankruptcyCasesUpdate = vi.fn().mockReturnValue({ eq: bankruptcyCasesUpdateEq })

    const caseResponsesUpsert = vi.fn().mockResolvedValue({ error: null })
    const caseAuditInsert = vi.fn().mockResolvedValue({ error: null })

    createSupabaseServiceRoleClientMock.mockReturnValue({
      from: (table: string) => {
        if (table === 'bankruptcy_cases') {
          return {
            select: bankruptcyCasesSelect,
            insert: bankruptcyCasesInsert,
            update: bankruptcyCasesUpdate,
          }
        }
        if (table === 'case_responses') {
          return { upsert: caseResponsesUpsert }
        }
        if (table === 'case_audit_events') {
          return { insert: caseAuditInsert }
        }
        throw new Error(`Unexpected table ${table}`)
      },
    })

    const response = await POST(
      new Request('https://oak.example.com/api/hamish/intake', {
        method: 'POST',
        headers: {
          authorization: 'Bearer hamish-secret',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          contactName: 'Jane Doe',
          chapter: '7',
          filingState: 'California',
          filingCounty: 'Alameda',
          stepId: 'filing-plan',
          answers: {
            chapter: '7',
            filing_state: 'California',
            california_district: 'northern',
            filing_county: 'Alameda',
            primarily_consumer_debts: true,
            exemption_system: '703',
            disabled_veteran_means_test_exception: false,
            active_military_means_test_exception: false,
            urgent_deadline: false,
          },
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(bankruptcyCasesInsert).toHaveBeenCalled()
    expect(caseResponsesUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        case_id: '11111111-1111-1111-1111-111111111111',
        step_id: 'filing-plan',
        completed: true,
      }),
      { onConflict: 'case_id,step_id' },
    )

    const body = await response.json()
    expect(body.caseId).toBe('11111111-1111-1111-1111-111111111111')
    expect(body.nextStepId).toBe('debtor-profile')
  })
})
