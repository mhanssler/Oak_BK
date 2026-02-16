import Link from 'next/link'
import { ChapterGuides } from '@/components/home/chapter-guides'
import {
  BAY_AREA_ATTORNEY_FEE_EXAMPLES,
  BAY_AREA_PRICING_LAST_CHECKED,
  FEDERAL_BANKRUPTCY_FILING_FEES,
} from '@/lib/pricing/bay-area'

const chapter7Examples = BAY_AREA_ATTORNEY_FEE_EXAMPLES.filter((entry) => entry.chapter === '7')
const chapter13Examples = BAY_AREA_ATTORNEY_FEE_EXAMPLES.filter((entry) => entry.chapter === '13')

const chapter7FeeSnapshot = 'Published Bay Area examples: $1,275 to $2,500'
const chapter13FeeSnapshot = 'Published Bay Area examples: $0 upfront to $3,500'

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Start Your Intake In Minutes</h1>
        <p>Secure step-by-step bankruptcy intake, built to keep things clear and moving.</p>
        <div className="row" style={{ marginTop: '0.75rem' }}>
          <Link className="button" href="/signup">
            Start Intake
          </Link>
          <Link className="button-secondary" href="/login">
            Continue Intake
          </Link>
        </div>
      </section>

      <ChapterGuides />

      <section className="surface process-overview-wrap">
        <div className="stack">
          <h2 style={{ margin: 0 }}>Published Bay Area Price Snapshot</h2>
          <p className="hint" style={{ margin: 0 }}>
            Public website examples only, last checked {BAY_AREA_PRICING_LAST_CHECKED}.
          </p>
          <div className="grid-two">
            <article className="process-overview-card">
              <h3>Chapter 7</h3>
              <p>{chapter7FeeSnapshot}</p>
              <p className="hint">{chapter7Examples.length} published Bay Area examples included.</p>
            </article>
            <article className="process-overview-card">
              <h3>Chapter 13</h3>
              <p>{chapter13FeeSnapshot}</p>
              <p className="hint">{chapter13Examples.length} published Bay Area examples included.</p>
            </article>
            <article className="process-overview-card">
              <h3>Federal Court Filing Fees</h3>
              <p className="hint">
                {FEDERAL_BANKRUPTCY_FILING_FEES.map((entry) => `Ch. ${entry.chapter}: ${entry.fee}`).join(' | ')}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
