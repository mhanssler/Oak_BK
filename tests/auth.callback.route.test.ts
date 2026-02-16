const { createSupabaseServerClientMock } = vi.hoisted(() => ({
  createSupabaseServerClientMock: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}))

import { GET } from '@/app/auth/callback/route'
import { sanitizeRedirectPath } from '@/lib/auth/redirects'

function toRedirectUrl(response: Response): URL {
  const location = response.headers.get('location')
  if (!location) {
    throw new Error('Expected redirect location header.')
  }
  return new URL(location)
}

describe('auth callback route', () => {
  beforeEach(() => {
    createSupabaseServerClientMock.mockReset()
  })

  it('sanitizes invalid next paths to dashboard', () => {
    expect(sanitizeRedirectPath(null)).toBe('/dashboard')
    expect(sanitizeRedirectPath('https://evil.example.com')).toBe('/dashboard')
    expect(sanitizeRedirectPath('/review/abc')).toBe('/review/abc')
  })

  it('redirects with missing_code status when code is missing', async () => {
    const response = await GET(new Request('https://oak.example.com/auth/callback?next=/review/123'))
    const url = toRedirectUrl(response)

    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
    expect(url.pathname).toBe('/auth/confirmed')
    expect(url.searchParams.get('status')).toBe('missing_code')
    expect(url.searchParams.get('next')).toBe('/review/123')
  })

  it('returns failed status when Supabase session exchange fails', async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: { message: 'invalid code' } })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    })

    const response = await GET(
      new Request('https://oak.example.com/auth/callback?code=abc&next=https://evil.example.com'),
    )
    const url = toRedirectUrl(response)

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc')
    expect(url.pathname).toBe('/auth/confirmed')
    expect(url.searchParams.get('status')).toBe('failed')
    expect(url.searchParams.get('next')).toBe('/dashboard')
  })

  it('returns success status after successful code exchange', async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession },
    })

    const response = await GET(new Request('https://oak.example.com/auth/callback?code=good&next=/intake/1'))
    const url = toRedirectUrl(response)

    expect(exchangeCodeForSession).toHaveBeenCalledWith('good')
    expect(url.pathname).toBe('/auth/confirmed')
    expect(url.searchParams.get('status')).toBe('success')
    expect(url.searchParams.get('next')).toBe('/intake/1')
  })
})
