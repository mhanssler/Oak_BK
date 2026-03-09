import 'server-only'

function readRequired(key: string): string {
  const value = process.env[key]
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export interface HamishConfig {
  apiToken: string
  officeOwnerUserId: string
  serviceRoleKey: string
}

export function getHamishConfig(): HamishConfig {
  return {
    apiToken: readRequired('HAMISH_API_TOKEN'),
    officeOwnerUserId: readRequired('HAMISH_CASE_OWNER_USER_ID'),
    serviceRoleKey: readRequired('SUPABASE_SERVICE_ROLE_KEY'),
  }
}
