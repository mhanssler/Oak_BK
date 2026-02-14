import Link from 'next/link'
import { signUpAction } from '@/app/login/actions'

export default function SignupPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>Create Your Secure Account</h1>
        <p>
          Start your intake now. You will verify your email first, then continue to the questionnaire.
        </p>
      </section>

      <section className="surface" style={{ padding: '1.25rem', marginBottom: '1.3rem' }}>
        <div className="stack">
          <div className="alert alert-success">
            Verification emails may land in spam at first. Mark as safe so future case updates arrive in
            your inbox.
          </div>

          <form action={signUpAction} className="stack">
            <div className="grid-two">
              <div className="field">
                <label htmlFor="full_name">Full legal name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Morgan Hanssler"
                  required
                />
              </div>
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
                  autoComplete="new-password"
                  minLength={12}
                  required
                />
                <span className="hint">Use at least 12 characters.</span>
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button className="button" type="submit">
                Create Account
              </button>
              <Link className="button-secondary" href="/login">
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
