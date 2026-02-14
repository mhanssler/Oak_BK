import type { User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'client'

export function getUserRole(user: User | null | undefined): AppRole {
  const roleValue = user?.app_metadata?.role
  if (typeof roleValue === 'string' && roleValue.toLowerCase() === 'admin') {
    return 'admin'
  }

  const roleList = user?.app_metadata?.roles
  if (Array.isArray(roleList) && roleList.some((role) => role === 'admin')) {
    return 'admin'
  }

  return 'client'
}

export function isAdminUser(user: User | null | undefined): boolean {
  return getUserRole(user) === 'admin'
}

export function getUserDisplayName(user: User | null | undefined): string | null {
  const nameValue = user?.user_metadata?.full_name
  if (typeof nameValue !== 'string') {
    return null
  }

  const trimmed = nameValue.trim()
  return trimmed.length > 0 ? trimmed : null
}
