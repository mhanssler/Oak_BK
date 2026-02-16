import Link from 'next/link'

const FAQ_ITEMS = [
  {
    question: 'What is Chapter 7?',
    answer:
      'Chapter 7 is usually a faster process that can eliminate eligible unsecured debt when qualification rules are met.',
  },
  {
    question: 'What is Chapter 13?',
    answer:
      'Chapter 13 uses a court-approved repayment plan, usually 3 to 5 years, and is often used to catch up on secured debt.',
  },
  {
    question: 'What is Chapter 11?',
    answer:
      'Chapter 11 is a reorganization chapter typically used for higher-debt or business-related situations.',
  },
  {
    question: 'What is Chapter 12?',
    answer: 'Chapter 12 is for eligible family farmers and fishers with regular annual income.',
  },
  {
    question: 'Will this portal choose my chapter automatically?',
    answer:
      'The intake screens for likely chapter fit. Final chapter selection is made by your attorney before filing.',
  },
  {
    question: 'Do I need every document before I start?',
    answer:
      'No. Start now and complete what you can. The checklist will show what is still missing.',
  },
]

export default function FaqPage() {
  return (
    <main>
      <section className="hero">
        <h1>Bankruptcy FAQ</h1>
        <p>Quick answers to the most common chapter and intake questions.</p>
      </section>

      <section className="surface faq-wrap">
        <div className="stack">
          <div className="faq-grid">
            {FAQ_ITEMS.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
          <div className="row">
            <Link className="button" href="/signup">
              Start Intake
            </Link>
            <Link className="button-secondary" href="/login">
              Continue Intake
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
