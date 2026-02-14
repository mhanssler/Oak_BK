describe('environment config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('reads required environment values', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.NEXT_PUBLIC_APP_URL = 'https://oak.example.com'

    const { env } = await import('@/lib/env')
    expect(env.supabaseUrl).toBe('https://project.supabase.co')
    expect(env.supabaseAnonKey).toBe('anon-key')
    expect(env.appUrl).toBe('https://oak.example.com')
  })

  it('throws when a required environment variable is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    await expect(import('@/lib/env')).rejects.toThrow(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL',
    )
  })
})
