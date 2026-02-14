import type { User } from '@supabase/supabase-js'
import { getUserDisplayName, getUserRole, isAdminUser } from '@/lib/auth/roles'

function makeUser(partial: Partial<User>): User {
  return partial as User
}

describe('auth roles', () => {
  it('returns admin for app_metadata role', () => {
    const user = makeUser({ app_metadata: { role: 'admin' } })
    expect(getUserRole(user)).toBe('admin')
    expect(isAdminUser(user)).toBe(true)
  })

  it('returns admin for app_metadata roles list', () => {
    const user = makeUser({ app_metadata: { roles: ['billing', 'admin'] } })
    expect(getUserRole(user)).toBe('admin')
  })

  it('defaults to client when no role is present', () => {
    const user = makeUser({ app_metadata: {} })
    expect(getUserRole(user)).toBe('client')
    expect(isAdminUser(user)).toBe(false)
  })

  it('returns trimmed display name when available', () => {
    const user = makeUser({ user_metadata: { full_name: '  Morgan Hanssler  ' } })
    expect(getUserDisplayName(user)).toBe('Morgan Hanssler')
  })

  it('returns null display name for missing or invalid values', () => {
    expect(getUserDisplayName(makeUser({ user_metadata: {} }))).toBeNull()
    expect(getUserDisplayName(makeUser({ user_metadata: { full_name: '   ' } }))).toBeNull()
    expect(getUserDisplayName(null)).toBeNull()
  })
})
