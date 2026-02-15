import Link from 'next/link'
import { signInAction } from '@/app/login/actions'

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
    text: 'Sign in failed. Check your credentials or verify your email.',
  },
  signup_failed: {
    tone: 'error',
    text: 'Account creation failed. Try again from the Create Account page.',
  },
  callback_failed: {
    tone: 'error',
    text: 'Email verification link could not be completed. Request a new verification link.',
  },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const status = readSingle(resolvedSearchParams.status)
  const message = status ? STATUS_MESSAGE[status] : null

  return (
    <main>
      <section className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>Welcome Back</h1>
        <p>Sign in to continue your bankruptcy intake and complete your filing packet.</p>
      </section>

      <section className="surface" style={{ padding: '1.2rem', marginBottom: '1.3rem' }}>
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

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="button" formAction={signInAction}>
                Sign In
              </button>
              <Link className="button-secondary" href="/signup">
                New client? Create account
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
