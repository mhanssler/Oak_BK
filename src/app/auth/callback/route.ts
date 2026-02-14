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
  const confirmedUrl = new URL('/auth/confirmed', requestUrl.origin)
  confirmedUrl.searchParams.set('next', nextPath)

  if (!code) {
    confirmedUrl.searchParams.set('status', 'missing_code')
    return NextResponse.redirect(confirmedUrl)
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    confirmedUrl.searchParams.set('status', 'failed')
    return NextResponse.redirect(confirmedUrl)
  }

  confirmedUrl.searchParams.set('status', 'success')
  return NextResponse.redirect(confirmedUrl)
}
