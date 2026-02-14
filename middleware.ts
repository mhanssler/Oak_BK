import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SECURITY_HEADERS: Array<[string, string]> = [
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
]

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  for (const [key, value] of SECURITY_HEADERS) {
    response.headers.set(key, value)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
