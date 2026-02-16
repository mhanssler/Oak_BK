import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/auth/roles'
import { assertTrustedOrigin } from '@/lib/security/origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function signOutAction() {
  'use server'

  await assertTrustedOrigin()
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SecureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const showAdminNav = isAdminUser(user)

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="row secure-nav">
            <Link href="/dashboard" style={{ fontWeight: 700 }}>
              Client Intake Portal
            </Link>
            {showAdminNav ? <Link href="/admin/cases">Admin Case Review</Link> : null}
            <span className="hint shell-user-email">Signed in as {user.email}</span>
          </div>
          <form action={signOutAction}>
            <button className="button-secondary" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <div className="shell-body">{children}</div>
      <footer className="public-footer">
        <div className="public-footer-inner">
          <span className="hint">Secure session active. All submissions are stored with access controls.</span>
          <span className="hint">Need help? Contact Hanssler Law support.</span>
        </div>
      </footer>
    </div>
  )
}
