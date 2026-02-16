import { AUTH_CONFIRMED_STATUS_MESSAGE, safeNextPath } from '@/app/auth/confirmed/page'
import { LOGIN_STATUS_MESSAGE } from '@/app/login/page'
import { SIGNUP_STATUS_MESSAGE } from '@/app/signup/page'

function assertActionableStatusMessages(
  map: Record<string, { tone: 'error' | 'success'; text: string }>,
  statusCodes: string[],
) {
  for (const statusCode of statusCodes) {
    const message = map[statusCode]
    expect(message).toBeDefined()
    expect(message.text.trim().length).toBeGreaterThanOrEqual(20)
    expect(message.text).not.toMatch(/^Something went wrong\.?$/i)
    expect(message.text).not.toMatch(/^Unknown error\.?$/i)
  }
}

describe('status messaging quality', () => {
  it('keeps sign-in statuses explicit and actionable', () => {
    assertActionableStatusMessages(LOGIN_STATUS_MESSAGE, [
      'missing_credentials',
      'auth_failed',
      'signup_failed',
      'callback_failed',
    ])
    expect(LOGIN_STATUS_MESSAGE.account_exists?.tone).toBe('success')
  })

  it('keeps sign-up statuses explicit and actionable', () => {
    assertActionableStatusMessages(SIGNUP_STATUS_MESSAGE, [
      'missing_credentials',
      'weak_password',
      'signup_failed',
    ])
  })

  it('restricts confirmation next path to internal URLs', () => {
    expect(safeNextPath('/dashboard')).toBe('/dashboard')
    expect(safeNextPath('https://evil.example.com')).toBe('/dashboard')
    expect(safeNextPath(null)).toBe('/dashboard')
  })

  it('defines explicit copy for auth confirmation outcomes', () => {
    expect(AUTH_CONFIRMED_STATUS_MESSAGE.success.text).toContain('verified')
    expect(AUTH_CONFIRMED_STATUS_MESSAGE.failed.text).toContain('invalid or expired')
    expect(AUTH_CONFIRMED_STATUS_MESSAGE.missing_code.text).toContain('without a valid verification token')
  })
})
