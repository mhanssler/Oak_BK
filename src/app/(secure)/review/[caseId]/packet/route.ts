import { QUESTIONNAIRE_STEPS } from '@/lib/questionnaire/steps'
import { getResponsePayload } from '@/lib/questionnaire/payload'
import { isAdminUser } from '@/lib/auth/roles'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: { caseId: string } }) {
  const caseId = params.caseId
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const caseQuery = supabase.from('bankruptcy_cases').select('*').eq('id', caseId)
  const { data: caseRecord } = isAdminUser(user)
    ? await caseQuery.maybeSingle()
    : await caseQuery.eq('user_id', user.id).maybeSingle()

  if (!caseRecord) {
    return new Response('Not found', { status: 404 })
  }

  const { data: responsesRaw } = await supabase
    .from('case_responses')
    .select('step_id, payload, completed, updated_at')
    .eq('case_id', caseId)

  const responseMap = new Map<
    string,
    { step_id: string; payload: Record<string, unknown>; completed: boolean; updated_at: string | null }
  >(
    ((responsesRaw || []) as Array<{
      step_id: string
      payload: unknown
      completed: boolean
      updated_at: string | null
    }>).map((row) => [
      row.step_id,
      {
        step_id: row.step_id,
        payload: getResponsePayload({ payload: row.payload }),
        completed: row.completed,
        updated_at: row.updated_at,
      },
    ]),
  )
  const packet = {
    packet_version: '2026.02.14',
    generated_at: new Date().toISOString(),
    case: {
      id: caseRecord.id,
      case_ref: caseRecord.case_ref,
      title: caseRecord.title,
      chapter: caseRecord.chapter,
      status: caseRecord.status,
      filing_state: caseRecord.filing_state,
      filing_county: caseRecord.filing_county,
      created_at: caseRecord.created_at,
      updated_at: caseRecord.updated_at,
    },
    steps: QUESTIONNAIRE_STEPS.map((step) => ({
      id: step.id,
      title: step.title,
      completed: Boolean(responseMap.get(step.id)?.completed),
      updated_at: responseMap.get(step.id)?.updated_at || null,
      answers: responseMap.get(step.id)?.payload || {},
    })),
  }

  const filename = `bankruptcy-case-${caseId}.json`
  return new Response(JSON.stringify(packet, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
