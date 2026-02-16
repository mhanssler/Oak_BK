export interface BayAreaAttorneyFeeExample {
  chapter: '7' | '13'
  provider: string
  area: string
  fee: string
  notes: string
  sourceUrl: string
}

export interface BankruptcyCourtFilingFee {
  chapter: '7' | '11' | '12' | '13'
  fee: string
}

export const BAY_AREA_PRICING_LAST_CHECKED = 'February 16, 2026'

export const BAY_AREA_ATTORNEY_FEE_EXAMPLES: BayAreaAttorneyFeeExample[] = [
  {
    chapter: '7',
    provider: 'MacLean Chung Law Offices',
    area: 'Alameda County',
    fee: '$1,275',
    notes: 'Promotional Chapter 7 attorney fee posted for Alameda County.',
    sourceUrl: 'https://www.wipeoutdebt.com/alameda-county-bankruptcy-lawyer/',
  },
  {
    chapter: '7',
    provider: 'LaVelle Law Offices',
    area: 'Oakland / San Francisco / San Jose',
    fee: '$1,795',
    notes: 'Standard Chapter 7 attorney fee listed on pricing page.',
    sourceUrl: 'https://lavellelaw.com/how-much-does-it-cost-to-file-bankruptcy/',
  },
  {
    chapter: '7',
    provider: 'Courson Law',
    area: 'San Francisco',
    fee: '$2,000 single / $2,500 joint',
    notes: 'Simple Chapter 7 fee listed with separate single and joint amounts.',
    sourceUrl: 'https://www.sflawyer.net/cost-to-file-bankruptcy',
  },
  {
    chapter: '13',
    provider: 'Bay Area Bankruptcy Center',
    area: 'San Francisco / Oakland / San Jose',
    fee: '$0 upfront to file',
    notes: 'Site states Chapter 13 can be filed with no upfront attorney fee.',
    sourceUrl: 'https://bayareabankruptcycenter.com/chapter-13-bankruptcy/',
  },
  {
    chapter: '13',
    provider: 'LaVelle Law Offices',
    area: 'Oakland / San Francisco / San Jose',
    fee: '$3,500',
    notes: 'Standard Chapter 13 attorney fee listed on pricing page.',
    sourceUrl: 'https://lavellelaw.com/how-much-does-it-cost-to-file-bankruptcy/',
  },
]

export const FEDERAL_BANKRUPTCY_FILING_FEES: BankruptcyCourtFilingFee[] = [
  { chapter: '7', fee: '$338' },
  { chapter: '13', fee: '$313' },
  { chapter: '11', fee: '$1,738' },
  { chapter: '12', fee: '$278' },
]

export const BANKRUPTCY_FILING_FEE_SOURCE_URL =
  'https://www.uscourts.gov/services-forms/fees/bankruptcy-courts-miscellaneous-fee-schedule'
