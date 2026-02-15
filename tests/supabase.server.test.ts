describe('supabase server client factory', () => {
  const originalEnv = process.env
  type CookieAdapter = {
    get(name: string): string | undefined
    set(name: string, value: string, options: Record<string, unknown>): void
    remove(name: string, options: Record<string, unknown>): void
  }

  beforeEach(() => {
    vi.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('builds a client with cookie adapters', async () => {
    const cookieStore = {
      get: vi.fn((name: string) => (name === 'session' ? { value: 'token' } : undefined)),
      set: vi.fn(),
    }

    const createServerClient = vi.fn(
      (_url: string, _key: string, config: { cookies: CookieAdapter }) => ({
        ok: true,
        config,
      }),
    )

    vi.doMock('next/headers', () => ({
      cookies: () => cookieStore,
    }))

    vi.doMock('@supabase/ssr', () => ({
      createServerClient,
    }))

    const { createSupabaseServerClient } = await import('@/lib/supabase/server')
    await createSupabaseServerClient()

    expect(createServerClient).toHaveBeenCalledTimes(1)
    const config = createServerClient.mock.calls[0]![2]
    expect(config.cookies.get('session')).toBe('token')

    config.cookies.set('session', 'new-token', { path: '/' })
    expect(cookieStore.set).toHaveBeenCalledWith({
      name: 'session',
      value: 'new-token',
      path: '/',
    })

    config.cookies.remove('session', { path: '/' })
    expect(cookieStore.set).toHaveBeenCalledWith({
      name: 'session',
      value: '',
      path: '/',
      maxAge: 0,
    })
  })

  it('swallows cookie write errors in read-only render contexts', async () => {
    const cookieStore = {
      get: vi.fn(),
      set: vi.fn(() => {
        throw new Error('read-only')
      }),
    }

    const createServerClient = vi.fn(
      (_url: string, _key: string, config: { cookies: CookieAdapter }) => ({
        ok: true,
        config,
      }),
    )

    vi.doMock('next/headers', () => ({
      cookies: () => cookieStore,
    }))

    vi.doMock('@supabase/ssr', () => ({
      createServerClient,
    }))

    const { createSupabaseServerClient } = await import('@/lib/supabase/server')
    await createSupabaseServerClient()

    const config = createServerClient.mock.calls[0]![2]
    expect(() => config.cookies.set('session', 'new-token', { path: '/' })).not.toThrow()
    expect(() => config.cookies.remove('session', { path: '/' })).not.toThrow()
  })
})

