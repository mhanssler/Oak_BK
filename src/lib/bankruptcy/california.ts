export type CaliforniaDistrict = 'northern' | 'eastern' | 'central' | 'southern'

const BASE_MEDIAN_BY_HOUSEHOLD_SIZE: Record<number, number> = {
  1: 77221,
  2: 100161,
  3: 113553,
  4: 135505,
}

export const CALIFORNIA_MEDIAN_INCOME_EFFECTIVE_DATE = '2025-11-01'
export const CALIFORNIA_MEDIAN_INCOME_INCREMENT = 11100

export function getCaliforniaMedianIncome(householdSize: number): number {
  const normalized = Math.max(1, Math.floor(householdSize))

  if (normalized <= 4) {
    return BASE_MEDIAN_BY_HOUSEHOLD_SIZE[normalized]
  }

  return BASE_MEDIAN_BY_HOUSEHOLD_SIZE[4] + (normalized - 4) * CALIFORNIA_MEDIAN_INCOME_INCREMENT
}

export const CALIFORNIA_EXEMPTION_SYSTEMS: Record<
  string,
  { label: string; detail: string; whenUsuallyUsed: string }
> = {
  '703': {
    label: 'CCP 703.140(b)',
    detail: 'Wildcard-focused system modeled after federal-style categories.',
    whenUsuallyUsed: 'Often used for renters, cash-heavy cases, or limited home equity.',
  },
  '704': {
    label: 'CCP 704',
    detail: 'Homestead-focused system with stronger primary residence protection.',
    whenUsuallyUsed: 'Often used when home equity is substantial.',
  },
}

export interface MeansTestInput {
  chapter: string | null
  householdSize: number | null
  monthlyIncomeHistory: number[]
  primarilyConsumerDebts: boolean | null
  disabledVeteranException: boolean | null
  activeMilitaryException: boolean | null
}

export type MeansTestStatus =
  | 'insufficient_data'
  | 'not_applicable'
  | 'chapter7_exempt'
  | 'chapter7_below_median'
  | 'chapter7_above_median'
  | 'chapter13_36_month'
  | 'chapter13_60_month'

export interface MeansTestSummary {
  status: MeansTestStatus
  title: string
  detail: string
  monthlyAverage: number | null
  annualizedIncome: number | null
  medianThreshold: number | null
  belowMedian: boolean | null
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const total = values.reduce((acc, value) => acc + value, 0)
  return total / values.length
}

function sanitizeIncomeHistory(values: number[]): number[] {
  return values
    .filter((value) => Number.isFinite(value))
    .map((value) => Number(value.toFixed(2)))
    .filter((value) => value >= 0)
}

export function summarizeCaliforniaMeansTest(input: MeansTestInput): MeansTestSummary {
  const chapter = input.chapter
  const householdSize = input.householdSize
  const history = sanitizeIncomeHistory(input.monthlyIncomeHistory)
  const hasEnoughIncomeHistory = history.length >= 6

  if (chapter !== '7' && chapter !== '13') {
    return {
      status: 'not_applicable',
      title: 'Means Test Not Applicable',
      detail: 'Means-test screening is focused on Chapter 7 and Chapter 13 consumer cases.',
      monthlyAverage: null,
      annualizedIncome: null,
      medianThreshold: null,
      belowMedian: null,
    }
  }

  if (!householdSize || !hasEnoughIncomeHistory) {
    return {
      status: 'insufficient_data',
      title: 'Means Test Needs More Data',
      detail: 'Add household size and six months of gross income to evaluate California median status.',
      monthlyAverage: null,
      annualizedIncome: null,
      medianThreshold: null,
      belowMedian: null,
    }
  }

  const monthlyAverage = Number(average(history).toFixed(2))
  const annualizedIncome = Number((monthlyAverage * 12).toFixed(2))
  const medianThreshold = getCaliforniaMedianIncome(householdSize)
  const belowMedian = annualizedIncome <= medianThreshold

  if (chapter === '7') {
    const primarilyConsumerDebts = input.primarilyConsumerDebts
    const hasException =
      input.disabledVeteranException === true || input.activeMilitaryException === true
    const nonConsumerCase = primarilyConsumerDebts === false

    if (hasException || nonConsumerCase) {
      return {
        status: 'chapter7_exempt',
        title: 'Chapter 7 Means-Test Exception Flagged',
        detail:
          'Possible exception based on military/veteran status or non-consumer debt profile; confirm 122A supplement handling.',
        monthlyAverage,
        annualizedIncome,
        medianThreshold,
        belowMedian,
      }
    }

    if (belowMedian) {
      return {
        status: 'chapter7_below_median',
        title: 'Chapter 7 Below California Median',
        detail:
          'Presumption supports Chapter 7 eligibility pathway; full 122A-2 is usually not required.',
        monthlyAverage,
        annualizedIncome,
        medianThreshold,
        belowMedian,
      }
    }

    return {
      status: 'chapter7_above_median',
      title: 'Chapter 7 Above California Median',
      detail:
        'Full means-test expense deductions and abuse-presumption analysis should be completed before filing.',
      monthlyAverage,
      annualizedIncome,
      medianThreshold,
      belowMedian,
    }
  }

  if (belowMedian) {
    return {
      status: 'chapter13_36_month',
      title: 'Chapter 13 Below Median Window',
      detail: 'Plan horizon is often 36 months unless other factors require a longer term.',
      monthlyAverage,
      annualizedIncome,
      medianThreshold,
      belowMedian,
    }
  }

  return {
    status: 'chapter13_60_month',
    title: 'Chapter 13 Above Median Window',
    detail: 'Plan horizon is often 60 months subject to final disposable-income calculations.',
    monthlyAverage,
    annualizedIncome,
    medianThreshold,
    belowMedian,
  }
}

export function asNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Number(value.toFixed(2))
}

export function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }
  return null
}

export function formatUsd(value: number | null): string {
  if (value === null) {
    return 'Not available'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
