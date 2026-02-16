import Link from 'next/link'
import { safeNextPath } from '@/lib/auth/redirects'
import { AUTH_CONFIRMED_STATUS_MESSAGE } from '@/lib/ui/status-messages'

function readSingle(value: string | string[] | undefined): string | null {
  if (!value) {
    return null
  }
  return Array.isArray(value) ? value[0] : value
}

export default async function AuthConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; next?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const statusCode = readSingle(resolvedSearchParams.status) || 'success'
  const nextPath = safeNextPath(readSingle(resolvedSearchParams.next))
  const status = AUTH_CONFIRMED_STATUS_MESSAGE[statusCode] || AUTH_CONFIRMED_STATUS_MESSAGE.success

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
              Continue Intake
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
