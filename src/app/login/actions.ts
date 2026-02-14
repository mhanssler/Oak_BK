'use server'

import { redirect } from 'next/navigation'
import { env } from '@/lib/env'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function normalizeEmail(raw: FormDataEntryValue | null): string {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw.trim().toLowerCase()
}

function normalizePassword(raw: FormDataEntryValue | null): string {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw
}

function toLoginPath(status: string): string {
  const params = new URLSearchParams()
  params.set('status', status)
  return `/login?${params.toString()}`
}

export async function signInAction(formData: FormData): Promise<void> {
  assertTrustedOrigin()

  const email = normalizeEmail(formData.get('email'))
  const password = normalizePassword(formData.get('password'))

  if (!email || !password) {
    redirect(toLoginPath('missing_credentials'))
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(toLoginPath('auth_failed'))
  }

  redirect('/dashboard')
}

export async function signUpAction(formData: FormData): Promise<void> {
  assertTrustedOrigin()

  const email = normalizeEmail(formData.get('email'))
  const password = normalizePassword(formData.get('password'))

  if (!email || !password) {
    redirect(toLoginPath('missing_credentials'))
  }

  if (password.length < 12) {
    redirect(toLoginPath('weak_password'))
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.appUrl}/auth/callback`,
    },
  })

  if (error) {
    redirect(toLoginPath('signup_failed'))
  }

  redirect(toLoginPath('signup_success'))
}
