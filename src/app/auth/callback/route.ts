import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function sanitizeRedirectPath(nextParam: string | null): string {
  if (!nextParam) {
    return '/dashboard'
  }

  if (!nextParam.startsWith('/')) {
    return '/dashboard'
  }

  return nextParam
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextPath = sanitizeRedirectPath(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
}
