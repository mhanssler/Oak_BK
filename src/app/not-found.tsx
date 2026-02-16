import Link from 'next/link'

export default function NotFound() {
  return (
    <main>
      <section className="hero">
        <h1>Page Not Found</h1>
        <p>The link you used is no longer valid, or the page has moved.</p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.2rem' }}>
        <div className="row">
          <Link className="button" href="/">
            Back To Home
          </Link>
          <Link className="button-secondary" href="/login">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  )
}
