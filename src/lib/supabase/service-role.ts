import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { getHamishConfig } from '@/lib/hamish/config'

export function createSupabaseServiceRoleClient() {
  const { serviceRoleKey } = getHamishConfig()
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
