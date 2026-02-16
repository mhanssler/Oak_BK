import {
  BANKRUPTCY_FILING_FEE_SOURCE_URL,
  BAY_AREA_ATTORNEY_FEE_EXAMPLES,
  FEDERAL_BANKRUPTCY_FILING_FEES,
} from '@/lib/pricing/bay-area'

describe('bay area pricing data', () => {
  it('contains source-backed attorney fee examples for chapter 7 and chapter 13', () => {
    expect(BAY_AREA_ATTORNEY_FEE_EXAMPLES.length).toBeGreaterThan(0)

    const chapters = new Set(BAY_AREA_ATTORNEY_FEE_EXAMPLES.map((entry) => entry.chapter))
    expect(chapters.has('7')).toBe(true)
    expect(chapters.has('13')).toBe(true)

    for (const entry of BAY_AREA_ATTORNEY_FEE_EXAMPLES) {
      expect(entry.fee.length).toBeGreaterThan(0)
      expect(entry.sourceUrl.startsWith('https://')).toBe(true)
    }
  })

  it('includes the federal filing fees by chapter', () => {
    const map = new Map(FEDERAL_BANKRUPTCY_FILING_FEES.map((entry) => [entry.chapter, entry.fee]))
    expect(map.get('7')).toBe('$338')
    expect(map.get('13')).toBe('$313')
    expect(map.get('11')).toBe('$1,738')
    expect(map.get('12')).toBe('$278')
    expect(BANKRUPTCY_FILING_FEE_SOURCE_URL).toContain('uscourts.gov')
  })
})
