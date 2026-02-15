import Link from 'next/link'

const STATUS_MESSAGE: Record<string, { tone: 'error' | 'success'; title: string; text: string }> = {
  success: {
    tone: 'success',
    title: 'Email Confirmed',
    text: 'Your account is verified and ready. Continue to your dashboard.',
  },
  failed: {
    tone: 'error',
    title: 'Verification Link Failed',
    text: 'The verification link was invalid or expired. Request a new account email and try again.',
  },
  missing_code: {
    tone: 'error',
    title: 'Verification Link Incomplete',
    text: 'This page was opened without a valid verification token.',
  },
}

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

function safeNextPath(path: string | null): string {
  if (!path || !path.startsWith('/')) {
    return '/dashboard'
  }
  return path
}

export default async function AuthConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; next?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const statusCode = readSingle(resolvedSearchParams.status) || 'success'
  const nextPath = safeNextPath(readSingle(resolvedSearchParams.next))
  const status = STATUS_MESSAGE[statusCode] || STATUS_MESSAGE.success

  return (
    <main>
      <section className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>{status.title}</h1>
        <p>{status.text}</p>
      </section>

      <section className="surface" style={{ padding: '1.25rem', marginBottom: '1.3rem' }}>
        <div className="stack">
          <div className={`alert ${status.tone === 'error' ? 'alert-error' : 'alert-success'}`}>
            {status.text}
          </div>
          <div className="row">
            <Link className="button" href={nextPath}>
              Continue
            </Link>
            <Link className="button-secondary" href="/login">
              Go To Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
