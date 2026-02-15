export type QuestionFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'boolean'

export interface QuestionOption {
  label: string
  value: string
}

export interface QuestionnaireField {
  key: string
  label: string
  type: QuestionFieldType
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: QuestionOption[]
}

export interface QuestionnaireStep {
  id: string
  title: string
  description: string
  fields: QuestionnaireField[]
}

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 'filing-plan',
    title: 'Filing Plan',
    description:
      'Capture chapter strategy, California venue, and exemption framework before intake details.',
    fields: [
      {
        key: 'chapter',
        label: 'Bankruptcy chapter',
        type: 'select',
        required: true,
        options: [
          { label: 'Chapter 7', value: '7' },
          { label: 'Chapter 13', value: '13' },
          { label: 'Chapter 11', value: '11' },
          { label: 'Chapter 12', value: '12' },
        ],
      },
      {
        key: 'filing_state',
        label: 'State where filing is planned',
        type: 'text',
        required: true,
        placeholder: 'California',
      },
      {
        key: 'california_district',
        label: 'California federal bankruptcy district',
        type: 'select',
        required: true,
        options: [
          { label: 'Northern District of California', value: 'northern' },
          { label: 'Eastern District of California', value: 'eastern' },
          { label: 'Central District of California', value: 'central' },
          { label: 'Southern District of California', value: 'southern' },
        ],
      },
      {
        key: 'filing_county',
        label: 'County',
        type: 'text',
        required: true,
        placeholder: 'Alameda',
      },
      {
        key: 'filing_division',
        label: 'Court division (if known)',
        type: 'text',
        placeholder: 'Oakland',
      },
      {
        key: 'primarily_consumer_debts',
        label: 'Are debts primarily consumer debts?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'exemption_system',
        label: 'California exemption system',
        type: 'select',
        required: true,
        options: [
          { label: 'CCP 703.140(b) system (wildcard-focused)', value: '703' },
          { label: 'CCP 704 system (homestead-focused)', value: '704' },
        ],
        helpText:
          'California is an opt-out state: federal exemptions cannot be used, and 703/704 cannot be mixed.',
      },
      {
        key: 'disabled_veteran_means_test_exception',
        label: 'Disabled veteran means-test exception may apply?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'active_military_means_test_exception',
        label: 'Active-duty military combat-zone means-test exception may apply?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'urgent_deadline',
        label: 'Any urgent deadline in next 14 days?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'deadline_details',
        label: 'Urgent deadline details',
        type: 'textarea',
        placeholder: 'Foreclosure date, garnishment hearing, repossession notice...',
      },
    ],
  },
  {
    id: 'debtor-profile',
    title: 'Debtor Profile',
    description: 'Collect identity, household composition, and filing history baseline.',
    fields: [
      {
        key: 'legal_name',
        label: 'Full legal name',
        type: 'text',
        required: true,
        placeholder: 'As shown on government ID',
      },
      {
        key: 'other_names_last_8_years',
        label: 'Other names used in the last 8 years',
        type: 'textarea',
        placeholder: 'Aliases, maiden names, or DBA names',
      },
      {
        key: 'date_of_birth',
        label: 'Date of birth',
        type: 'date',
        required: true,
      },
      {
        key: 'ssn_last4',
        label: 'SSN last 4',
        type: 'text',
        required: true,
        placeholder: '1234',
      },
      {
        key: 'marital_status',
        label: 'Marital status',
        type: 'select',
        required: true,
        options: [
          { label: 'Single', value: 'single' },
          { label: 'Married', value: 'married' },
          { label: 'Separated', value: 'separated' },
          { label: 'Divorced', value: 'divorced' },
          { label: 'Widowed', value: 'widowed' },
        ],
      },
      {
        key: 'spouse_filing_jointly',
        label: 'Will spouse file jointly?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'household_size',
        label: 'Household size',
        type: 'number',
        required: true,
      },
    ],
  },
  {
    id: 'contact-residence',
    title: 'Contact And Residence',
    description:
      'Capture reliable contact channels and recent address history for venue and filing checks.',
    fields: [
      {
        key: 'email',
        label: 'Primary email',
        type: 'text',
        required: true,
        placeholder: 'name@example.com',
      },
      {
        key: 'phone',
        label: 'Mobile phone',
        type: 'text',
        required: true,
        placeholder: '(555) 555-5555',
      },
      {
        key: 'address_line_1',
        label: 'Street address',
        type: 'text',
        required: true,
      },
      {
        key: 'city',
        label: 'City',
        type: 'text',
        required: true,
      },
      {
        key: 'state',
        label: 'State',
        type: 'text',
        required: true,
        placeholder: 'CA',
      },
      {
        key: 'zip_code',
        label: 'ZIP code',
        type: 'text',
        required: true,
      },
      {
        key: 'years_at_address',
        label: 'Years at current address',
        type: 'number',
        required: true,
      },
      {
        key: 'prior_addresses_last_180_days',
        label: 'Prior addresses in the last 180 days',
        type: 'textarea',
        required: true,
        placeholder: 'Address, city, state, ZIP and dates lived there',
      },
    ],
  },
  {
    id: 'income-employment',
    title: 'Income And Employment',
    description:
      'Capture schedule I data and six full months of gross income for California means-test review.',
    fields: [
      {
        key: 'employment_status',
        label: 'Employment status',
        type: 'select',
        required: true,
        options: [
          { label: 'Employed', value: 'employed' },
          { label: 'Self-employed', value: 'self_employed' },
          { label: 'Unemployed', value: 'unemployed' },
          { label: 'Retired', value: 'retired' },
          { label: 'Disabled', value: 'disabled' },
        ],
      },
      {
        key: 'employer_name',
        label: 'Employer name',
        type: 'text',
      },
      {
        key: 'income_month_1',
        label: 'Gross income month 1 (oldest)',
        type: 'currency',
        required: true,
      },
      {
        key: 'income_month_2',
        label: 'Gross income month 2',
        type: 'currency',
        required: true,
      },
      {
        key: 'income_month_3',
        label: 'Gross income month 3',
        type: 'currency',
        required: true,
      },
      {
        key: 'income_month_4',
        label: 'Gross income month 4',
        type: 'currency',
        required: true,
      },
      {
        key: 'income_month_5',
        label: 'Gross income month 5',
        type: 'currency',
        required: true,
      },
      {
        key: 'income_month_6',
        label: 'Gross income month 6 (most recent)',
        type: 'currency',
        required: true,
      },
      {
        key: 'spouse_monthly_income',
        label: 'Spouse monthly gross income',
        type: 'currency',
      },
      {
        key: 'other_income',
        label: 'Other recurring monthly income',
        type: 'currency',
        required: true,
      },
      {
        key: 'projected_income_change',
        label: 'Projected income changes',
        type: 'textarea',
        placeholder: 'Job changes, bonus changes, or expected reductions/increases',
      },
      {
        key: 'income_notes',
        label: 'Income notes',
        type: 'textarea',
        placeholder: 'Bonuses, seasonal fluctuations, commissions, overtime...',
      },
    ],
  },
  {
    id: 'assets',
    title: 'Assets',
    description: 'Collect Schedule A/B asset values and exemption-sensitive ownership details.',
    fields: [
      {
        key: 'owns_primary_residence',
        label: 'Own primary residence?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'home_value',
        label: 'Estimated home value',
        type: 'currency',
      },
      {
        key: 'home_mortgage_balance',
        label: 'Estimated mortgage balance',
        type: 'currency',
      },
      {
        key: 'vehicle_count',
        label: 'Number of vehicles owned/leased',
        type: 'number',
        required: true,
      },
      {
        key: 'bank_balance_total',
        label: 'Total cash and bank balances',
        type: 'currency',
        required: true,
      },
      {
        key: 'retirement_accounts_total',
        label: 'Total retirement account value',
        type: 'currency',
      },
      {
        key: 'valuable_property',
        label: 'Any property worth over $1,000 each?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'asset_notes',
        label: 'Asset details',
        type: 'textarea',
        placeholder: 'Real estate, collectibles, business interests, pending claims...',
      },
    ],
  },
  {
    id: 'debts',
    title: 'Debts',
    description: 'Capture obligations for schedules D, E/F and creditor matrix preparation.',
    fields: [
      {
        key: 'secured_debt_total',
        label: 'Total secured debt',
        type: 'currency',
        required: true,
      },
      {
        key: 'unsecured_debt_total',
        label: 'Total unsecured debt',
        type: 'currency',
        required: true,
      },
      {
        key: 'priority_debt_total',
        label: 'Total priority debt',
        type: 'currency',
      },
      {
        key: 'largest_creditor',
        label: 'Largest creditor name',
        type: 'text',
        required: true,
      },
      {
        key: 'recent_large_payments_90d',
        label: 'Any recent large creditor payments in last 90 days?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'co_signers_or_joint_debts',
        label: 'Any co-signers or joint debts?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'lawsuits_or_garnishment',
        label: 'Any current lawsuits, judgments, or garnishments?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'debt_notes',
        label: 'Debt notes',
        type: 'textarea',
        placeholder: 'Collection actions, co-debtors, vehicle deficiencies...',
      },
    ],
  },
  {
    id: 'expenses',
    title: 'Monthly Expenses',
    description: 'Capture Schedule J monthly expense detail and chapter 13 plan feasibility inputs.',
    fields: [
      {
        key: 'housing_expense',
        label: 'Housing (rent/mortgage)',
        type: 'currency',
        required: true,
      },
      {
        key: 'utilities_expense',
        label: 'Utilities',
        type: 'currency',
        required: true,
      },
      {
        key: 'food_expense',
        label: 'Food and housekeeping',
        type: 'currency',
        required: true,
      },
      {
        key: 'transportation_expense',
        label: 'Transportation',
        type: 'currency',
        required: true,
      },
      {
        key: 'insurance_expense',
        label: 'Insurance',
        type: 'currency',
      },
      {
        key: 'support_expense',
        label: 'Alimony/child support',
        type: 'currency',
      },
      {
        key: 'tax_expense_not_withheld',
        label: 'Taxes not withheld from payroll',
        type: 'currency',
      },
      {
        key: 'total_monthly_expenses',
        label: 'Total monthly expenses',
        type: 'currency',
        required: true,
      },
      {
        key: 'expense_notes',
        label: 'Expense notes',
        type: 'textarea',
        placeholder: 'Irregular but necessary expenses, medical costs, dependent care...',
      },
    ],
  },
  {
    id: 'history-disclosures',
    title: 'History And Disclosures',
    description: 'Gather Statement of Financial Affairs lookback disclosures and refiling risks.',
    fields: [
      {
        key: 'prior_bankruptcy',
        label: 'Filed bankruptcy before?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'prior_case_filing_date',
        label: 'Most recent prior filing date',
        type: 'date',
      },
      {
        key: 'prior_case_details',
        label: 'Prior case details',
        type: 'textarea',
        placeholder: 'Case number, district, chapter, outcome, discharge/dismissal date',
      },
      {
        key: 'prior_dismissal_last_year',
        label: 'Any prior dismissal in the last year?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'property_transfers_last_2y',
        label: 'Transferred property in the last 2 years?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'insider_payments_last_1y',
        label: 'Paid relatives/insiders over $600 in the last year?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'business_interest',
        label: 'Own part of a business?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'disclosure_notes',
        label: 'Disclosure details',
        type: 'textarea',
        placeholder: 'Transfers, lawsuits, repossessions, business operations...',
      },
    ],
  },
  {
    id: 'compliance-checkpoints',
    title: 'Compliance Checkpoints',
    description:
      'Capture mandatory counseling, debtor education, and trustee-meeting readiness milestones.',
    fields: [
      {
        key: 'credit_counseling_completed',
        label: 'Pre-filing credit counseling completed?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'credit_counseling_date',
        label: 'Credit counseling date',
        type: 'date',
      },
      {
        key: 'credit_counseling_certificate_ready',
        label: 'Credit counseling certificate available?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'debtor_education_completed',
        label: 'Post-filing debtor education completed?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'debtor_education_date',
        label: 'Debtor education date',
        type: 'date',
      },
      {
        key: 'attend_341_meeting_acknowledged',
        label: 'Client understands attendance at 341 meeting is mandatory?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'authorized_credit_pull',
        label: 'Client signed authorization for credit report pull (FCRA purpose)?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'credit_report_provider_type',
        label: 'Credit report source',
        type: 'select',
        required: true,
        options: [
          { label: 'Attorney-ordered tri-merge report', value: 'tri_merge_attorney' },
          { label: 'Client-provided report pending attorney verification', value: 'client_report' },
          { label: 'Legacy report from prior legal matter', value: 'legacy_legal_report' },
        ],
      },
      {
        key: 'credit_report_pulled_date',
        label: 'Credit report pull date',
        type: 'date',
        required: true,
      },
      {
        key: 'credit_report_reference',
        label: 'Credit report reference ID',
        type: 'text',
        placeholder: 'Internal report ID or vendor reference number',
      },
      {
        key: 'all_credit_cards_disclosed',
        label: 'All known credit cards/lines of credit are disclosed?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'all_bank_accounts_disclosed',
        label: 'All checking, savings, brokerage, and money accounts are disclosed?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'liabilities_reconciled_to_credit_report',
        label: 'Debts reconciled against the pulled credit report?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'undisclosed_accounts_resolved',
        label: 'Any newly discovered accounts have been resolved and added?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'cm_ecf_workflow_reviewed',
        label: 'Court ECM/CM-ECF filing workflow reviewed with the client?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'meeting_341_notice_received',
        label: 'Section 341(a) meeting notice received?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'meeting_341_platform',
        label: 'Section 341(a) meeting platform',
        type: 'select',
        required: true,
        options: [
          { label: 'Zoom', value: 'zoom' },
          { label: 'Telephone', value: 'telephone' },
          { label: 'In-person', value: 'in_person' },
          { label: 'Other virtual platform', value: 'other_virtual' },
        ],
      },
      {
        key: 'meeting_341_date',
        label: 'Section 341(a) meeting date',
        type: 'date',
      },
      {
        key: 'meeting_341_join_link',
        label: 'Section 341(a) meeting join link',
        type: 'text',
        placeholder: 'https://...',
      },
      {
        key: 'authorization_signed_date',
        label: 'Authorization signed date',
        type: 'date',
      },
      {
        key: 'compliance_notes',
        label: 'Compliance notes',
        type: 'textarea',
        placeholder: 'Counseling provider, trustee prep notes, language accommodations...',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Document Readiness',
    description: 'Confirm required source documents before final legal filing review.',
    fields: [
      {
        key: 'has_paystubs',
        label: 'Have last 6 months of paystubs?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'has_tax_returns',
        label: 'Have last 2-4 years of tax returns?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'has_bank_statements',
        label: 'Have last 3-6 months of bank statements?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'id_and_ssn_docs_ready',
        label: 'Government ID and social security proof ready?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'has_vehicle_and_property_docs',
        label: 'Vehicle title/registration and property loan docs ready?',
        type: 'boolean',
        required: true,
      },
      {
        key: 'attorney_notes',
        label: 'Additional notes for legal team',
        type: 'textarea',
        placeholder: 'Anything the trustee should know before filing...',
      },
    ],
  },
]

const STEP_INDEX = new Map<string, number>(
  QUESTIONNAIRE_STEPS.map((step, index) => [step.id, index]),
)

export function getQuestionnaireStep(stepId: string | null | undefined): QuestionnaireStep {
  if (!stepId) {
    return QUESTIONNAIRE_STEPS[0]
  }

  const index = STEP_INDEX.get(stepId)
  if (index === undefined) {
    return QUESTIONNAIRE_STEPS[0]
  }

  return QUESTIONNAIRE_STEPS[index]
}

export function getNextStepId(stepId: string): string | null {
  const index = STEP_INDEX.get(stepId)
  if (index === undefined || index === QUESTIONNAIRE_STEPS.length - 1) {
    return null
  }
  return QUESTIONNAIRE_STEPS[index + 1].id
}

export function getPreviousStepId(stepId: string): string | null {
  const index = STEP_INDEX.get(stepId)
  if (index === undefined || index === 0) {
    return null
  }
  return QUESTIONNAIRE_STEPS[index - 1].id
}

