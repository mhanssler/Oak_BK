import Link from 'next/link'

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

export default function SignupVerifyPage({
  searchParams,
}: {
  searchParams: { email?: string | string[] }
}) {
  const email = readSingle(searchParams.email)

  return (
    <main>
      <section className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>Check Your Email</h1>
        <p>
          We sent your verification link{email ? ` to ${email}` : ''}. Open it to activate your
          account and continue intake.
        </p>
      </section>

      <section className="surface" style={{ padding: '1.25rem', marginBottom: '1.3rem' }}>
        <div className="stack">
          <div className="grid-two">
            <div className="surface" style={{ padding: '0.9rem' }}>
              <strong>1. Find the email</strong>
              <p className="hint">Check inbox first, then Spam/Junk and Promotions folders.</p>
            </div>
            <div className="surface" style={{ padding: '0.9rem' }}>
              <strong>2. Click verify link</strong>
              <p className="hint">The link opens a confirmation page and starts your secure session.</p>
            </div>
            <div className="surface" style={{ padding: '0.9rem' }}>
              <strong>3. Mark as safe</strong>
              <p className="hint">
                Mark this sender as safe to avoid future filing reminders going to spam.
              </p>
            </div>
            <div className="surface" style={{ padding: '0.9rem' }}>
              <strong>4. Sign in if needed</strong>
              <p className="hint">If the session expires, sign in and continue from your dashboard.</p>
            </div>
          </div>

          <div className="row">
            <Link className="button" href="/login">
              Go To Sign In
            </Link>
            <Link className="button-secondary" href="/signup">
              Use a Different Email
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
