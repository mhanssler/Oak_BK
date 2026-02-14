import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Bankruptcy Intake That Is Faster, Structured, And Trustee-Ready</h1>
        <p>
          This application guides each client through a secure, account-based interview and
          generates a complete bankruptcy packet for attorney review before filing.
        </p>
      </section>

      <section className="surface" style={{ padding: '1.2rem', marginBottom: '1.2rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>What this workflow covers</h2>
          <div className="grid-two">
            <div>
              <h3 style={{ marginTop: 0 }}>Client Guided Intake</h3>
              <p>
                Step-by-step capture of profile, income, assets, debts, expenses, disclosures, and
                source documents.
              </p>
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>Attorney Control</h3>
              <p>
                Draft status, completion flags, and a structured packet export provide a clean handoff
                for final legal review.
              </p>
            </div>
          </div>
          <div className="row">
            <Link className="button" href="/login">
              Client Sign In
            </Link>
            <span className="hint">
              For legal operations use only. Attorney review is always required before filing.
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
