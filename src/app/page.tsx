import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section className="hero hero-split">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <h1>A Faster Bankruptcy Intake, Built For Real Client Use</h1>
          <p>
            Create an account, answer the guided questionnaire, and deliver complete filing-ready data
            for attorney review and trustee preparation.
          </p>
          <div className="row">
            <Link className="button" href="/signup">
              Create Account
            </Link>
            <Link className="button-secondary" href="/login">
              Sign In
            </Link>
          </div>
        </div>

        <div className="surface hero-emblem-wrap">
          <Image
            src="/oak-emblem.svg"
            alt="Shadowed oak tree emblem"
            width={420}
            height={420}
            className="hero-emblem"
            priority
          />
        </div>
      </section>

      <section className="grid-two" style={{ marginBottom: '1.2rem' }}>
        <article className="surface feature-card">
          <h2>Guided Intake</h2>
          <p>
            Debtor profile, income history, assets, debts, expenses, disclosures, counseling checks, and
            document readiness in one secure flow.
          </p>
        </article>
        <article className="surface feature-card">
          <h2>California-Aware Logic</h2>
          <p>
            Built-in checkpoints for district selection, means-test screening, and California exemption
            path selection (703 vs. 704).
          </p>
        </article>
        <article className="surface feature-card">
          <h2>Attorney-Ready Packet</h2>
          <p>
            Every completed section flows into a structured review packet before final submission for
            legal review.
          </p>
        </article>
        <article className="surface feature-card">
          <h2>Secure By Default</h2>
          <p>
            Account-based access, row-level database security, audit events, and secret-safety controls
            are embedded into the platform baseline.
          </p>
        </article>
      </section>
    </main>
  )
}
