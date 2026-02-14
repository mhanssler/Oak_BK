import Link from 'next/link'
import { redirect } from 'next/navigation'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function signOutAction() {
  'use server'

  assertTrustedOrigin()
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SecureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="row">
            <Link href="/dashboard" style={{ fontWeight: 700 }}>
              Hanssler Law Intake
            </Link>
            <span className="hint">Signed in as {user.email}</span>
          </div>
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <div className="shell-body">{children}</div>
    </div>
  )
}
