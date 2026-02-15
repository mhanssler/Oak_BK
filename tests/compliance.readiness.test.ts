import {
  TRUSTEE_RESOURCE_LINKS,
  buildTrusteeReadinessChecks,
  listBlockingReadinessGaps,
  toHttpUrl,
} from '@/lib/compliance/readiness'

describe('trustee readiness checks', () => {
  it('returns blocking gaps when critical controls are incomplete', () => {
    const fields: Record<string, unknown> = {
      credit_counseling_completed: true,
      credit_counseling_certificate_ready: false,
      authorized_credit_pull: true,
      all_credit_cards_disclosed: false,
      all_bank_accounts_disclosed: true,
      liabilities_reconciled_to_credit_report: true,
      undisclosed_accounts_resolved: true,
      cm_ecf_workflow_reviewed: true,
      attend_341_meeting_acknowledged: false,
      meeting_341_notice_received: false,
      debtor_education_completed: false,
    }

    const checks = buildTrusteeReadinessChecks((key) => fields[key])
    const gaps = listBlockingReadinessGaps(checks)

    expect(gaps).toContain('Credit counseling certificate available')
    expect(gaps).toContain('All known credit cards/lines of credit disclosed')
    expect(gaps).toContain('Client acknowledges mandatory 341(a) attendance')
    expect(gaps).not.toContain('341(a) meeting notice received')
    expect(gaps).not.toContain('Post-filing debtor education completed')
  })

  it('exposes official resource links for counseling and hearing workflow', () => {
    expect(TRUSTEE_RESOURCE_LINKS.cmEcf).toContain('uscourts.gov')
    expect(TRUSTEE_RESOURCE_LINKS.creditCounseling).toContain('justice.gov/ust')
    expect(TRUSTEE_RESOURCE_LINKS.debtorEducation).toContain('justice.gov/ust')
    expect(TRUSTEE_RESOURCE_LINKS.section341Meetings).toContain('justice.gov/ust')
  })

  it('accepts only http/https meeting links', () => {
    expect(toHttpUrl('https://example.com/meeting')).toBe('https://example.com/meeting')
    expect(toHttpUrl('http://example.com/meeting')).toBe('http://example.com/meeting')
    expect(toHttpUrl('javascript:alert(1)')).toBeNull()
    expect(toHttpUrl('')).toBeNull()
  })
})
