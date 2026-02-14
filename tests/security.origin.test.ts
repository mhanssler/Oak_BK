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

  it('allows requests with missing origin or host headers', () => {
    setHeaders({ origin: null, host: null })
    expect(() => assertTrustedOrigin()).not.toThrow()
  })

  it('allows trusted origin when protocol and host match', () => {
    setHeaders({
      origin: 'https://app.example.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    expect(() => assertTrustedOrigin()).not.toThrow()
  })

  it('rejects mismatched origin', () => {
    setHeaders({
      origin: 'https://evil.example.com',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    expect(() => assertTrustedOrigin()).toThrow('Invalid request origin.')
  })

  it('rejects malformed origin values', () => {
    setHeaders({
      origin: 'not-a-url',
      host: 'app.example.com',
      'x-forwarded-proto': 'https',
    })
    expect(() => assertTrustedOrigin()).toThrow('Invalid request origin.')
  })
})
