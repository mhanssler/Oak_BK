import Link from 'next/link'
import { signInAction, signUpAction } from '@/app/login/actions'

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; text: string }> = {
  missing_credentials: {
    tone: 'error',
    text: 'Enter both email and password.',
  },
  weak_password: {
    tone: 'error',
    text: 'Use a password with at least 12 characters.',
  },
  auth_failed: {
    tone: 'error',
    text: 'Sign in failed. Check credentials or confirm your email.',
  },
  signup_failed: {
    tone: 'error',
    text: 'Account creation failed. Try another email or reset your password.',
  },
  signup_success: {
    tone: 'success',
    text: 'Account created. Check email for verification before signing in.',
  },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { status?: string | string[] }
}) {
  const status = readSingle(searchParams.status)
  const message = status ? STATUS_MESSAGE[status] : null

  return (
    <main>
      <section className="hero">
        <h1>Secure Client Access</h1>
        <p>Use one account per client and never share credentials across staff.</p>
      </section>

      <section className="surface" style={{ padding: '1.2rem', marginBottom: '1.2rem' }}>
        <div className="stack">
          {message ? (
            <div className={`alert ${message.tone === 'error' ? 'alert-error' : 'alert-success'}`}>
              {message.text}
            </div>
          ) : null}

          <form className="stack">
            <div className="grid-two">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="row">
              <button className="button" formAction={signInAction}>
                Sign In
              </button>
              <button className="button-secondary" formAction={signUpAction}>
                Create Account
              </button>
            </div>
            <p className="hint">
              New passwords must be at least 12 characters. MFA is strongly recommended in Supabase
              dashboard settings.
            </p>
          </form>
        </div>
      </section>

      <p className="hint" style={{ marginBottom: '1.8rem' }}>
        <Link href="/">Back to overview</Link>
      </p>
    </main>
  )
}
