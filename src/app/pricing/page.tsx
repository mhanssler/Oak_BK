import Link from 'next/link'
import {
  BANKRUPTCY_FILING_FEE_SOURCE_URL,
  BAY_AREA_ATTORNEY_FEE_EXAMPLES,
  BAY_AREA_PRICING_LAST_CHECKED,
  FEDERAL_BANKRUPTCY_FILING_FEES,
} from '@/lib/pricing/bay-area'

export default function PricingPage() {
  return (
    <main>
      <section className="hero">
        <h1>Bay Area Bankruptcy Pricing Snapshot</h1>
        <p>
          Publicly posted pricing examples only. Figures can change by firm and case complexity. Last
          checked {BAY_AREA_PRICING_LAST_CHECKED}.
        </p>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Published Bay Area Attorney Fee Examples</h2>
          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th>Provider</th>
                  <th>Area</th>
                  <th>Posted Fee</th>
                  <th>Notes</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {BAY_AREA_ATTORNEY_FEE_EXAMPLES.map((entry) => (
                  <tr key={`${entry.provider}-${entry.chapter}-${entry.fee}`}>
                    <td>Chapter {entry.chapter}</td>
                    <td>{entry.provider}</td>
                    <td>{entry.area}</td>
                    <td>{entry.fee}</td>
                    <td>{entry.notes}</td>
                    <td>
                      <a className="hint" href={entry.sourceUrl} target="_blank" rel="noreferrer">
                        View Source
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>Federal Bankruptcy Court Filing Fees</h2>
          <p className="hint" style={{ margin: 0 }}>
            Filing fees are federal and not Bay Area-specific. Always verify the latest schedule before
            filing.
          </p>
          <div className="grid-two">
            {FEDERAL_BANKRUPTCY_FILING_FEES.map((entry) => (
              <article className="process-overview-card" key={entry.chapter}>
                <h3>Chapter {entry.chapter}</h3>
                <p>{entry.fee}</p>
              </article>
            ))}
          </div>
          <a className="hint" href={BANKRUPTCY_FILING_FEE_SOURCE_URL} target="_blank" rel="noreferrer">
            View Federal Filing Fee Source
          </a>
        </div>
      </section>

      <section className="surface" style={{ padding: '1rem', marginBottom: '1.3rem' }}>
        <div className="row">
          <Link className="button" href="/signup">
            Start Intake
          </Link>
          <Link className="button-secondary" href="/login">
            Continue Intake
          </Link>
          <Link className="button-secondary" href="/faq">
            View FAQ
          </Link>
        </div>
      </section>
    </main>
  )
}
