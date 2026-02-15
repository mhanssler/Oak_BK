import { headers } from 'next/headers'

export async function assertTrustedOrigin(): Promise<void> {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')

  if (!origin || !host) {
    return
  }

  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  const protocol = forwardedProto && forwardedProto.length > 0 ? forwardedProto : 'https'

  try {
    const originUrl = new URL(origin)
    if (`${protocol}://${host}` !== originUrl.origin) {
      throw new Error('Untrusted form origin.')
    }
  } catch {
    throw new Error('Invalid request origin.')
  }
}
