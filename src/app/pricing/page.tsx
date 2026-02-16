import Link from 'next/link'

const PRICING_PLANS = [
  {
    name: 'Intake Essentials',
    price: '$149',
    cadence: 'per case intake',
    features: [
      'Secure account onboarding and case creation',
      'Guided bankruptcy questionnaire and chapter screening',
      'Case packet export for attorney review',
    ],
  },
  {
    name: 'Trustee-Ready Plus',
    price: '$299',
    cadence: 'per case intake',
    features: [
      'Everything in Intake Essentials',
      'Credit-report and account reconciliation checklist',
      '341(a) hearing prep tracking and meeting-link management',
      'Pre-filing and post-filing counseling checkpoint tracking',
    ],
  },
  {
    name: 'Attorney Assisted Filing',
    price: '$599',
    cadence: 'starting price per case',
    features: [
      'Everything in Trustee-Ready Plus',
      'Attorney workflow handoff for ECM/CM-ECF filing prep',
      'Trustee-ready packet quality review',
      'Priority support scheduling',
    ],
  },
]

export default function PricingPage() {
  return (
    <main>
      <section className="hero">
        <h1>Simple, Transparent Pricing</h1>
        <p>
          Case-based pricing for secure intake, trustee-readiness controls, and legal-team handoff.
          Designed to help you start fast without hidden workflow fees.
        </p>
      </section>

      <section className="grid-two" style={{ marginBottom: '1rem' }}>
        {PRICING_PLANS.map((plan) => (
          <article className="surface pricing-card" key={plan.name}>
            <h2>{plan.name}</h2>
            <p className="pricing-amount">
              {plan.price} <span className="hint">({plan.cadence})</span>
            </p>
            <ul className="pricing-list">
              {plan.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link className="button" href="/signup">
              Get Started
            </Link>
          </article>
        ))}
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.3rem' }}>
        <div className="stack" style={{ gap: '0.6rem' }}>
          <strong>Launch Promotion</strong>
          <p className="hint" style={{ margin: 0 }}>
            Social ad visitors can begin with Intake Essentials and upgrade later without re-entering
            data.
          </p>
          <div className="row">
            <Link className="button" href="/signup">
              Claim Launch Access
            </Link>
            <Link className="button-secondary" href="/process">
              Review Filing Process
            </Link>
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.3rem' }}>
        <p className="hint" style={{ margin: 0 }}>
          Final legal fees, filing fees, and trustee-related costs vary by chapter, district, and case
          complexity. Pricing shown here is for software and workflow services.
        </p>
      </section>
    </main>
  )
}
