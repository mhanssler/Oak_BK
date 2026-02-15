'use server'

import { headers } from 'next/headers'
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

function normalizeFullName(raw: FormDataEntryValue | null): string {
  if (typeof raw !== 'string') {
    return ''
  }
  return raw.trim().replace(/\s+/g, ' ')
}

function toLoginPath(status: string): string {
  const params = new URLSearchParams()
  params.set('status', status)
  return `/login?${params.toString()}`
}

async function inferRequestOrigin(): Promise<string> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'https'

  if (!host) {
    return env.appUrl
  }

  if (host.includes('localhost')) {
    return `http://${host}`
  }

  return `${proto}://${host}`
}

export async function signInAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin()

  const email = normalizeEmail(formData.get('email'))
  const password = normalizePassword(formData.get('password'))

  if (!email || !password) {
    redirect(toLoginPath('missing_credentials'))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(toLoginPath('auth_failed'))
  }

  redirect('/dashboard')
}

export async function signUpAction(formData: FormData): Promise<void> {
  await assertTrustedOrigin()

  const email = normalizeEmail(formData.get('email'))
  const password = normalizePassword(formData.get('password'))
  const fullName = normalizeFullName(formData.get('full_name'))

  if (!email || !password || !fullName) {
    redirect(toLoginPath('missing_credentials'))
  }

  if (password.length < 12) {
    redirect(toLoginPath('weak_password'))
  }

  const supabase = await createSupabaseServerClient()
  const origin = await inferRequestOrigin()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    redirect(toLoginPath('signup_failed'))
  }

  const params = new URLSearchParams()
  params.set('email', email)
  redirect(`/signup/verify?${params.toString()}`)
}
