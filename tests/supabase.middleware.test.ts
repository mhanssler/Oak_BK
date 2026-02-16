const { createServerClientMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

function createMockRequest(): NextRequest {
  const values = new Map<string, string>()
  return {
    headers: new Headers({
      host: 'oak.example.com',
      'x-forwarded-proto': 'https',
    }),
    cookies: {
      get: vi.fn((name: string) => {
        const value = values.get(name)
        return value ? { value } : undefined
      }),
      set: vi.fn((entry: { name: string; value: string }) => {
        values.set(entry.name, entry.value)
      }),
    },
  } as unknown as NextRequest
}

describe('supabase middleware session refresh', () => {
  beforeEach(() => {
    createServerClientMock.mockReset()
  })

  it('fails open when auth refresh throws', async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error('network unavailable')),
      },
    })
    const request = createMockRequest()
    await expect(updateSession(request)).resolves.toBeDefined()
  })

  it('uses cookie adapters for set/remove operations', async () => {
    const request = createMockRequest()
    createServerClientMock.mockImplementation(
      (_url: string, _key: string, config: { cookies: Record<string, (...args: unknown[]) => void> }) => ({
        auth: {
          getUser: vi.fn(async () => {
            config.cookies.set('sb-session', 'token-value', { path: '/' })
            config.cookies.remove('sb-refresh', { path: '/' })
            return { data: { user: null }, error: null }
          }),
        },
      }),
    )

    const response = await updateSession(request)

    expect(request.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'sb-session',
        value: 'token-value',
      }),
    )
    expect(request.cookies.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'sb-refresh',
        value: '',
      }),
    )
    expect(response.headers.get('set-cookie')).toContain('sb-refresh=')
  })
})
