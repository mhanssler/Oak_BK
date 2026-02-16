'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main>
      <section className="hero">
        <h1>We Hit A Connection Issue</h1>
        <p>
          The page could not finish loading right now. Your data is safe. Retry now or return to the
          home page.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.2rem' }}>
        <div className="stack">
          <div className="alert alert-error">
            We could not complete this request. If this keeps happening, contact support and share this
            time: {new Date().toLocaleString()}.
          </div>
          <div className="row">
            <button className="button" onClick={reset} type="button">
              Retry
            </button>
            <Link className="button-secondary" href="/">
              Back To Home
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
