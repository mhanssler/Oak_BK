import { asBoolean } from '@/lib/bankruptcy/california'

export interface ReadinessCheck {
  key: string
  label: string
  done: boolean
  blocking: boolean
  helpHref?: string
}

export const TRUSTEE_RESOURCE_LINKS = {
  cmEcf: 'https://www.uscourts.gov/court-records/electronic-filing-cm-ecf',
  creditCounseling:
    'https://www.justice.gov/ust/list-credit-counseling-agencies-approved-pursuant-11-usc-111',
  debtorEducation:
    'https://www.justice.gov/ust/list-approved-providers-personal-financial-management-instructional-courses-debtor-education',
  section341Meetings: 'https://www.justice.gov/ust/moc',
} as const

export function buildTrusteeReadinessChecks(readField: (fieldKey: string) => unknown): ReadinessCheck[] {
  return [
    {
      key: 'credit_counseling_completed',
      label: 'Pre-filing credit counseling completed',
      done: asBoolean(readField('credit_counseling_completed')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.creditCounseling,
    },
    {
      key: 'credit_counseling_certificate_ready',
      label: 'Credit counseling certificate available',
      done: asBoolean(readField('credit_counseling_certificate_ready')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.creditCounseling,
    },
    {
      key: 'authorized_credit_pull',
      label: 'Credit report authorization signed',
      done: asBoolean(readField('authorized_credit_pull')) === true,
      blocking: true,
    },
    {
      key: 'all_credit_cards_disclosed',
      label: 'All known credit cards/lines of credit disclosed',
      done: asBoolean(readField('all_credit_cards_disclosed')) === true,
      blocking: true,
    },
    {
      key: 'all_bank_accounts_disclosed',
      label: 'All checking/savings/brokerage accounts disclosed',
      done: asBoolean(readField('all_bank_accounts_disclosed')) === true,
      blocking: true,
    },
    {
      key: 'liabilities_reconciled_to_credit_report',
      label: 'Debts reconciled against pulled credit report',
      done: asBoolean(readField('liabilities_reconciled_to_credit_report')) === true,
      blocking: true,
    },
    {
      key: 'undisclosed_accounts_resolved',
      label: 'Newly discovered accounts resolved and added',
      done: asBoolean(readField('undisclosed_accounts_resolved')) === true,
      blocking: true,
    },
    {
      key: 'cm_ecf_workflow_reviewed',
      label: 'Court ECM/CM-ECF filing workflow reviewed',
      done: asBoolean(readField('cm_ecf_workflow_reviewed')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.cmEcf,
    },
    {
      key: 'court_forms_sequence_validated',
      label: 'Court form sequence validated',
      done: asBoolean(readField('court_forms_sequence_validated')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.cmEcf,
    },
    {
      key: 'creditor_matrix_reviewed',
      label: 'Creditor matrix reviewed',
      done: asBoolean(readField('creditor_matrix_reviewed')) === true,
      blocking: true,
    },
    {
      key: 'court_notices_calendar_synced',
      label: 'Court notices and deadlines synced to calendar',
      done: asBoolean(readField('court_notices_calendar_synced')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.cmEcf,
    },
    {
      key: 'proof_of_claim_deadlines_tracked',
      label: 'Proof-of-claim and objection deadlines tracked',
      done: asBoolean(readField('proof_of_claim_deadlines_tracked')) === true,
      blocking: false,
      helpHref: TRUSTEE_RESOURCE_LINKS.cmEcf,
    },
    {
      key: 'trustee_document_portal_ready',
      label: 'Trustee document portal upload set is ready',
      done: asBoolean(readField('trustee_document_portal_ready')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.section341Meetings,
    },
    {
      key: 'meeting_341_notice_received',
      label: '341(a) meeting notice received',
      done: asBoolean(readField('meeting_341_notice_received')) === true,
      blocking: false,
      helpHref: TRUSTEE_RESOURCE_LINKS.section341Meetings,
    },
    {
      key: 'attend_341_meeting_acknowledged',
      label: 'Client acknowledges mandatory 341(a) attendance',
      done: asBoolean(readField('attend_341_meeting_acknowledged')) === true,
      blocking: true,
      helpHref: TRUSTEE_RESOURCE_LINKS.section341Meetings,
    },
    {
      key: 'debtor_education_completed',
      label: 'Post-filing debtor education completed',
      done: asBoolean(readField('debtor_education_completed')) === true,
      blocking: false,
      helpHref: TRUSTEE_RESOURCE_LINKS.debtorEducation,
    },
  ]
}

export function listBlockingReadinessGaps(checks: ReadinessCheck[]): string[] {
  return checks.filter((check) => check.blocking && !check.done).map((check) => check.label)
}

export function toHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}
