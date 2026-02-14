import {
  asBoolean,
  asNumber,
  formatUsd,
  getCaliforniaMedianIncome,
  recommendChapterFromIntake,
  summarizeCaliforniaMeansTest,
} from '@/lib/bankruptcy/california'

describe('california bankruptcy helpers', () => {
  it('calculates median income thresholds by household size', () => {
    expect(getCaliforniaMedianIncome(1)).toBe(77221)
    expect(getCaliforniaMedianIncome(4)).toBe(135505)
    expect(getCaliforniaMedianIncome(5)).toBe(146605)
  })

  it('returns insufficient data when means-test inputs are incomplete', () => {
    const result = summarizeCaliforniaMeansTest({
      chapter: '7',
      householdSize: null,
      monthlyIncomeHistory: [],
      primarilyConsumerDebts: true,
      disabledVeteranException: false,
      activeMilitaryException: false,
    })

    expect(result.status).toBe('insufficient_data')
  })

  it('returns chapter7 below median when annualized income is under threshold', () => {
    const result = summarizeCaliforniaMeansTest({
      chapter: '7',
      householdSize: 1,
      monthlyIncomeHistory: [3000, 3000, 3000, 3000, 3000, 3000],
      primarilyConsumerDebts: true,
      disabledVeteranException: false,
      activeMilitaryException: false,
    })

    expect(result.status).toBe('chapter7_below_median')
    expect(result.belowMedian).toBe(true)
  })

  it('returns chapter13 60 month when annualized income is above threshold', () => {
    const result = summarizeCaliforniaMeansTest({
      chapter: '13',
      householdSize: 1,
      monthlyIncomeHistory: [10000, 10000, 10000, 10000, 10000, 10000],
      primarilyConsumerDebts: true,
      disabledVeteranException: false,
      activeMilitaryException: false,
    })

    expect(result.status).toBe('chapter13_60_month')
    expect(result.belowMedian).toBe(false)
  })

  it('recommends chapter 7 for below-median means-test result', () => {
    const recommendation = recommendChapterFromIntake({
      selectedChapter: '7',
      meansSummary: summarizeCaliforniaMeansTest({
        chapter: '7',
        householdSize: 1,
        monthlyIncomeHistory: [3000, 3000, 3000, 3000, 3000, 3000],
        primarilyConsumerDebts: true,
        disabledVeteranException: false,
        activeMilitaryException: false,
      }),
      businessInterest: false,
      securedDebtTotal: 0,
      ownsPrimaryResidence: false,
    })

    expect(recommendation.code).toBe('chapter7')
  })

  it('recommends chapter 11 for business-heavy profile', () => {
    const recommendation = recommendChapterFromIntake({
      selectedChapter: '13',
      meansSummary: summarizeCaliforniaMeansTest({
        chapter: '13',
        householdSize: 2,
        monthlyIncomeHistory: [5000, 5000, 5000, 5000, 5000, 5000],
        primarilyConsumerDebts: true,
        disabledVeteranException: false,
        activeMilitaryException: false,
      }),
      businessInterest: true,
      securedDebtTotal: 900000,
      ownsPrimaryResidence: true,
    })

    expect(recommendation.code).toBe('chapter11')
  })

  it('parses primitive helper types', () => {
    expect(asNumber(12.345)).toBe(12.35)
    expect(asNumber('12')).toBeNull()
    expect(asBoolean(true)).toBe(true)
    expect(asBoolean('true')).toBeNull()
  })

  it('formats usd values', () => {
    expect(formatUsd(null)).toBe('Not available')
    expect(formatUsd(1234)).toBe('$1,234.00')
  })
})
