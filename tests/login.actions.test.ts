const { headersMock, redirectMock, assertTrustedOriginMock, createSupabaseServerClientMock } = vi.hoisted(
  () => ({
    headersMock: vi.fn(),
    redirectMock: vi.fn(),
    assertTrustedOriginMock: vi.fn(),
    createSupabaseServerClientMock: vi.fn(),
  }),
)

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/security/origin', () => ({
  assertTrustedOrigin: assertTrustedOriginMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}))

import { signInAction, signUpAction } from '@/app/login/actions'

type RedirectError = Error & { location?: string }

function createFormData(values: Record<string, string>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }
  return formData
}

async function captureRedirect(action: Promise<void>): Promise<string> {
  try {
    await action
  } catch (error) {
    const redirectError = error as RedirectError
    if (typeof redirectError.location === 'string') {
      return redirectError.location
    }
    throw error
  }
  throw new Error('Expected redirect.')
}

function mockRequestHeaders(values: Record<string, string | null | undefined>) {
  headersMock.mockResolvedValue({
    get: (name: string) => values[name.toLowerCase()] ?? null,
  })
}

describe('login server actions', () => {
  beforeEach(() => {
    headersMock.mockReset()
    redirectMock.mockReset()
    assertTrustedOriginMock.mockReset()
    createSupabaseServerClientMock.mockReset()

    assertTrustedOriginMock.mockResolvedValue(undefined)
    redirectMock.mockImplementation((location: string) => {
      const error = new Error(`REDIRECT:${location}`) as RedirectError
      error.location = location
      throw error
    })
    mockRequestHeaders({
      host: 'oak.example.com',
      'x-forwarded-host': 'oak.example.com',
      'x-forwarded-proto': 'https',
    })
  })

  it('redirects with clear status when sign-in credentials are missing', async () => {
    const location = await captureRedirect(signInAction(createFormData({ email: '', password: '' })))
    expect(location).toBe('/login?status=missing_credentials')
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
  })

  it('redirects with auth_failed when Supabase sign-in fails', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: { message: 'invalid login' } })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signInWithPassword },
    })

    const location = await captureRedirect(
      signInAction(createFormData({ email: 'client@example.com', password: '123456789012' })),
    )

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'client@example.com',
      password: '123456789012',
    })
    expect(location).toBe('/login?status=auth_failed')
  })

  it('redirects to dashboard on successful sign-in', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signInWithPassword },
    })

    const location = await captureRedirect(
      signInAction(createFormData({ email: 'client@example.com', password: '123456789012' })),
    )
    expect(location).toBe('/dashboard')
  })

  it('blocks signup with weak password and missing fields', async () => {
    const missingLocation = await captureRedirect(signUpAction(createFormData({ email: '', password: '' })))
    expect(missingLocation).toBe('/signup?status=missing_credentials')

    const weakLocation = await captureRedirect(
      signUpAction(
        createFormData({
          full_name: 'Jane Client',
          email: 'jane@example.com',
          password: 'short',
        }),
      ),
    )
    expect(weakLocation).toBe('/signup?status=weak_password')
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
  })

  it('redirects to login when account already exists', async () => {
    const signUp = vi.fn().mockResolvedValue({
      error: { message: 'User already registered', code: 'user_already_exists' },
    })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signUp },
    })

    const location = await captureRedirect(
      signUpAction(
        createFormData({
          full_name: 'Jane Client',
          email: 'jane@example.com',
          password: '123456789012',
        }),
      ),
    )

    expect(location).toBe('/login?status=account_exists')
  })

  it('sets callback origin from forwarded host and normalizes account name/email', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signUp },
    })
    mockRequestHeaders({
      host: 'oak.example.com',
      'x-forwarded-host': 'oak.example.com',
      'x-forwarded-proto': 'https',
    })

    const location = await captureRedirect(
      signUpAction(
        createFormData({
          full_name: '  Jane   Client  ',
          email: '  JANE@EXAMPLE.COM ',
          password: '123456789012',
        }),
      ),
    )

    expect(signUp).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: '123456789012',
      options: {
        emailRedirectTo: 'https://oak.example.com/auth/callback',
        data: {
          full_name: 'Jane Client',
        },
      },
    })

    expect(location).toBe('/signup/verify?email=jane%40example.com')
  })

  it('uses http callback origin for localhost development', async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null })
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signUp },
    })
    mockRequestHeaders({
      host: 'localhost:3000',
      'x-forwarded-host': 'localhost:3000',
      'x-forwarded-proto': 'https',
    })

    await captureRedirect(
      signUpAction(
        createFormData({
          full_name: 'Dev User',
          email: 'dev@example.com',
          password: '123456789012',
        }),
      ),
    )

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        }),
      }),
    )
  })
})
