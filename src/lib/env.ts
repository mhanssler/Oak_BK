const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number]

function readEnv(key: RequiredEnvKey): string {
  const value = process.env[key]
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}
