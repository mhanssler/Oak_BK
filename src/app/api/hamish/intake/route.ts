import { NextResponse } from 'next/server'
import { getHamishConfig } from '@/lib/hamish/config'
import {
  buildHamishCaseTitle,
  buildHamishResponseSummary,
  hamishSchemaResponse,
  hamishUpsertRequestSchema,
  isValidHamishBearer,
} from '@/lib/hamish/intake'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role'

type CaseLookup = {
  id: string
  case_ref: string | null
  chapter: string
  filing_state: string | null
  filing_county: string | null
  status: 'draft' | 'submitted' | 'archived'
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

async function resolveCase(params: {
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>
  officeOwnerUserId: string
  caseId?: string
  caseRef?: string
  title?: string
  contactName?: string
  chapter?: string
  filingState?: string
  filingCounty?: string
}): Promise<CaseLookup> {
  const { supabase } = params

  if (params.caseId) {
    const { data } = await supabase
      .from('bankruptcy_cases')
      .select('id, case_ref, chapter, filing_state, filing_county, status')
      .eq('id', params.caseId)
      .maybeSingle()

    if (data) {
      return data as CaseLookup
    }
  }

  if (params.caseRef) {
    const { data } = await supabase
      .from('bankruptcy_cases')
      .select('id, case_ref, chapter, filing_state, filing_county, status')
      .eq('case_ref', params.caseRef)
      .maybeSingle()

    if (data) {
      return data as CaseLookup
    }
  }

  const title = buildHamishCaseTitle({ title: params.title, contactName: params.contactName })
  const chapter = params.chapter ?? '7'
  const { data, error } = await supabase
    .from('bankruptcy_cases')
    .insert({
      user_id: params.officeOwnerUserId,
      title,
      chapter,
      filing_state: params.filingState ?? null,
      filing_county: params.filingCounty ?? null,
    })
    .select('id, case_ref, chapter, filing_state, filing_county, status')
    .single()

  if (error || !data) {
    throw new Error('Unable to create Hamish intake case.')
  }

  await supabase.from('case_audit_events').insert({
    case_id: data.id,
    user_id: params.officeOwnerUserId,
    action: 'hamish_case_created',
    metadata: {
      source: 'hamish_api',
      case_ref: data.case_ref,
      contact_name: params.contactName ?? null,
    },
  })

  return data as CaseLookup
}

export async function GET(request: Request) {
  const { apiToken } = getHamishConfig()
  if (!isValidHamishBearer(request.headers.get('authorization'), apiToken)) {
    return unauthorized()
  }

  return NextResponse.json(hamishSchemaResponse)
}

export async function POST(request: Request) {
  const { apiToken, officeOwnerUserId } = getHamishConfig()
  if (!isValidHamishBearer(request.headers.get('authorization'), apiToken)) {
    return unauthorized()
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return badRequest('Expected JSON body.')
  }

  const parsed = hamishUpsertRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return badRequest('Invalid Hamish intake payload.')
  }

  const payload = parsed.data
  const summary = buildHamishResponseSummary({
    stepId: payload.stepId,
    answers: payload.answers,
  })

  const supabase = createSupabaseServiceRoleClient()
  const resolvedCase = await resolveCase({
    supabase,
    officeOwnerUserId,
    caseId: payload.caseId,
    caseRef: payload.caseRef,
    title: payload.title,
    contactName: payload.contactName,
    chapter: payload.chapter,
    filingState: payload.filingState,
    filingCounty: payload.filingCounty,
  })

  const casePatch: Record<string, string | null | undefined> = {}
  if (payload.chapter) {
    casePatch.chapter = payload.chapter
  }
  if (payload.filingState) {
    casePatch.filing_state = payload.filingState
  }
  if (payload.filingCounty) {
    casePatch.filing_county = payload.filingCounty
  }
  if (payload.markSubmitted) {
    casePatch.status = 'submitted'
  }

  if (Object.keys(casePatch).length > 0) {
    await supabase.from('bankruptcy_cases').update(casePatch).eq('id', resolvedCase.id)
  }

  await supabase.from('case_responses').upsert(
    {
      case_id: resolvedCase.id,
      step_id: summary.step.id,
      payload: summary.validation.payload,
      completed: summary.validation.completed,
    },
    { onConflict: 'case_id,step_id' },
  )

  await supabase.from('case_audit_events').insert({
    case_id: resolvedCase.id,
    user_id: officeOwnerUserId,
    action: 'hamish_step_saved',
    metadata: {
      source: 'hamish_api',
      step_id: summary.step.id,
      completed: summary.validation.completed,
      missing_required_fields: summary.validation.missingRequiredFields,
    },
  })

  return NextResponse.json({
    caseId: resolvedCase.id,
    caseRef: resolvedCase.case_ref,
    status: payload.markSubmitted ? 'submitted' : resolvedCase.status,
    step: {
      id: summary.step.id,
      title: summary.step.title,
      description: summary.step.description,
    },
    completed: summary.validation.completed,
    missingRequiredFields: summary.validation.missingRequiredFields,
    nextStepId: summary.nextStepId,
    savedPayload: summary.validation.payload,
  })
}
