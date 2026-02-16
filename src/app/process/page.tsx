import Link from 'next/link'

const OFFICIAL_LINKS = [
  {
    label: 'CM/ECF Electronic Filing Overview (U.S. Courts)',
    href: 'https://www.uscourts.gov/court-records/electronic-filing-cm-ecf',
  },
  {
    label: 'Approved Pre-Filing Credit Counseling Agencies (U.S. Trustee Program)',
    href: 'https://www.justice.gov/ust/list-credit-counseling-agencies-approved-pursuant-11-usc-111',
  },
  {
    label: 'Approved Post-Filing Debtor Education Providers (U.S. Trustee Program)',
    href: 'https://www.justice.gov/ust/list-approved-providers-personal-financial-management-instructional-courses-debtor-education',
  },
  {
    label: 'Section 341(a) Meeting Resources (U.S. Trustee Program)',
    href: 'https://www.justice.gov/ust/moc',
  },
]

const ENTERPRISE_PATTERNS = [
  'Court form sequence validation before submission',
  'Creditor matrix review against intake + credit report',
  'Case notice/deadline calendar synchronization',
  '341(a) hearing platform/date/link tracking',
  'Trustee document portal readiness checkpoints',
]

export default function ProcessPage() {
  return (
    <main>
      <section className="hero">
        <h1>Court And Trustee Process</h1>
        <p>
          This workflow tracks the key ECM/CM-ECF, counseling, credit-report, and 341(a) preparation
          checkpoints so cases are filing-ready.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Operational Workflow</h2>
          <ol className="process-list">
            <li>Create client account and open intake case.</li>
            <li>Collect full debt/asset/income profile and supporting documents.</li>
            <li>Obtain and reconcile credit report against all disclosed accounts.</li>
            <li>Track pre-filing and post-filing counseling requirements.</li>
            <li>Record 341(a) notice, platform, date, and meeting link.</li>
            <li>Complete trustee-readiness blockers before final submission.</li>
          </ol>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Enterprise-Style Case Controls</h2>
          <p className="hint" style={{ margin: 0 }}>
            Oak uses workflow controls commonly found in professional bankruptcy preparation systems,
            adapted for a client-first intake experience.
          </p>
          <ul className="process-list">
            {ENTERPRISE_PATTERNS.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Official References</h2>
          <div className="stack" style={{ gap: '0.5rem' }}>
            {OFFICIAL_LINKS.map((link) => (
              <a key={link.href} className="hint" href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.3rem' }}>
        <p className="hint" style={{ margin: 0 }}>
          Trustee and court procedures vary by district and assigned trustee. Always confirm scheduling
          and platform details from the official notice for each case.
        </p>
        <div className="row" style={{ marginTop: '0.75rem' }}>
          <Link className="button" href="/signup">
            Start Intake
          </Link>
          <Link className="button-secondary" href="/pricing">
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  )
}
