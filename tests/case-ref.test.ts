import { createCaseReference } from '@/lib/cases/case-ref'

describe('case reference generation', () => {
  it('creates a normalized case reference with unique suffix', () => {
    const ref = createCaseReference('Morgan Hanssler')
    expect(ref).toMatch(/^morgan-hanssler-[a-f0-9]{10}$/)
  })

  it('falls back to client prefix when no name is provided', () => {
    const ref = createCaseReference(null)
    expect(ref).toMatch(/^client-[a-f0-9]{10}$/)
  })

  it('keeps the unique suffix even with long names', () => {
    const longName = `${'Alexandria '.repeat(20)}Johnson`
    const ref = createCaseReference(longName)
    expect(ref.length).toBeLessThanOrEqual(72)
    expect(ref).toMatch(/[a-f0-9]{10}$/)
    expect(ref.includes('--')).toBe(false)
  })

  it('creates different values across calls', () => {
    const first = createCaseReference('Morgan Hanssler')
    const second = createCaseReference('Morgan Hanssler')
    expect(first).not.toBe(second)
  })
})
