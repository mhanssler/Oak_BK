import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section className="hero hero-split">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <h1>Start Your Bankruptcy Intake With Confidence</h1>
          <p>
            Create your account, complete the guided form, and share your full financial picture with
            our legal team. The system screens your answers to suggest the likely chapter path.
          </p>
          <div className="row">
            <Link className="button" href="/signup">
              Start My Account
            </Link>
            <Link className="button-secondary" href="/login">
              Continue My Intake
            </Link>
          </div>
        </div>

        <div className="surface hero-emblem-wrap">
          <Image
            src="/mighty_oak.png"
            alt="Shadowed oak tree emblem"
            width={500}
            height={500}
            className="hero-emblem"
            priority
          />
        </div>
      </section>

      <section className="grid-two" style={{ marginBottom: '1.2rem' }}>
        <article className="surface feature-card">
          <h2>Guided Client Intake</h2>
          <p>
            Debtor profile, income history, assets, debts, expenses, disclosures, counseling checks, and
            document readiness in one secure flow built for clients.
          </p>
        </article>
        <article className="surface feature-card">
          <h2>Chapter Screening Logic</h2>
          <p>
            We evaluate your intake details against California means-test and exemption checkpoints to
            screen for likely chapter fit.
          </p>
        </article>
        <article className="surface feature-card">
          <h2>Attorney Review Packet</h2>
          <p>
            Every completed section is assembled into a structured packet for legal review before filing.
          </p>
        </article>
        <article className="surface feature-card">
          <h2>Case Tracking</h2>
          <p>
            Each case receives a unique case ID so your information can be tracked clearly from intake
            through filing preparation.
          </p>
        </article>
      </section>

      <section className="surface faq-wrap">
        <div className="stack">
          <h2 style={{ margin: 0 }}>Bankruptcy FAQ</h2>
          <div className="faq-grid">
            <article className="faq-item">
              <h3>What is Chapter 7?</h3>
              <p>
                Chapter 7 is usually a faster process that can eliminate eligible unsecured debt. It often
                works best when income is below the means-test threshold.
              </p>
            </article>
            <article className="faq-item">
              <h3>What is Chapter 13?</h3>
              <p>
                Chapter 13 is a repayment-plan chapter, usually over 3 to 5 years. It is often used when
                income is above Chapter 7 limits or when you need to keep assets while catching up.
              </p>
            </article>
            <article className="faq-item">
              <h3>What is Chapter 11?</h3>
              <p>
                Chapter 11 is a reorganization chapter often used for higher-debt or business-related
                situations that need a customized restructuring plan.
              </p>
            </article>
            <article className="faq-item">
              <h3>What is Chapter 12?</h3>
              <p>
                Chapter 12 is a specialized chapter for eligible family farmers and fishers with regular
                annual income.
              </p>
            </article>
            <article className="faq-item">
              <h3>Will the form choose my chapter automatically?</h3>
              <p>
                The form screens your data and generates a recommended chapter path. Final chapter
                selection is confirmed by your attorney before any filing.
              </p>
            </article>
            <article className="faq-item">
              <h3>Do I need every document before I start?</h3>
              <p>
                No. Start now and complete what you can. The intake checklist tells you exactly what is
                missing so you can finish quickly.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
