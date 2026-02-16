'use client'

import Link from 'next/link'

export default function SecureError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main>
      <section className="hero">
        <h1>Secure Session Error</h1>
        <p>
          We could not complete this secure action right now. Retry, or return to your dashboard and
          continue.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.2rem' }}>
        <div className="stack">
          <div className="alert alert-error">
            This request did not complete. No data was submitted by this failed attempt.
          </div>
          <div className="row">
            <button className="button" onClick={reset} type="button">
              Retry
            </button>
            <Link className="button-secondary" href="/dashboard">
              Back To Dashboard
            </Link>
          </div>
          {process.env.NODE_ENV !== 'production' ? (
            <pre className="hint" style={{ whiteSpace: 'pre-wrap' }}>
              {error.message}
            </pre>
          ) : null}
        </div>
      </section>
    </main>
  )
}
