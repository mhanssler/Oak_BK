const { updateSessionMock } = vi.hoisted(() => ({
  updateSessionMock: vi.fn(),
}))

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: updateSessionMock,
}))

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { config, middleware } from '../middleware'

describe('root middleware', () => {
  beforeEach(() => {
    updateSessionMock.mockReset()
  })

  it('adds security headers to every protected response', async () => {
    updateSessionMock.mockResolvedValue(NextResponse.next())
    const request = {
      headers: new Headers({
        host: 'oak.example.com',
      }),
    } as unknown as NextRequest

    const response = await middleware(request)

    expect(updateSessionMock).toHaveBeenCalledWith(request)
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()')
  })

  it('protects secure and auth route prefixes', () => {
    expect(config.matcher).toEqual([
      '/dashboard/:path*',
      '/intake/:path*',
      '/review/:path*',
      '/admin/:path*',
      '/auth/:path*',
    ])
  })
})
