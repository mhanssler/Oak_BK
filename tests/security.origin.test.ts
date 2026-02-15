import { vi } from 'vitest'

const getHeaderValue = vi.fn((_: string): string | null => null)

vi.mock('next/headers', () => ({
  headers: () => ({
    get: getHeaderValue,
  }),
}))

import { assertTrustedOrigin } from '@/lib/security/origin'

function setHeaders(values: Record<string, string | null | undefined>) {
  getHeaderValue.mockImplementation((key: string) => values[key] ?? null)
}

describe('origin security checks', () => {
  beforeEach(() => {
    getHeaderValue.mockReset()
  })

  it('allows requests with missing origin or host headers', async () => {
    setHeaders({ origin: null, host: null })
    await expect(assertTrustedOrigin()).resolves.toBeUndefined()
  })

  it('allows trusted origin when protocol and host match', async () => {
    setHeaders({
      origin: 'https://app.example.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    await expect(assertTrustedOrigin()).resolves.toBeUndefined()
  })

  it('rejects mismatched origin', async () => {
    setHeaders({
      origin: 'https://evil.example.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    await expect(assertTrustedOrigin()).rejects.toThrow('Invalid request origin.')
  })

  it('rejects malformed origin values', async () => {
    setHeaders({
      origin: 'not-a-url',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    await expect(assertTrustedOrigin()).rejects.toThrow('Invalid request origin.')
  })
})
