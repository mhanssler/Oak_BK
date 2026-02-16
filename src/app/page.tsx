import Image from 'next/image'
import Link from 'next/link'
import { ChapterGuides } from '@/components/home/chapter-guides'

const SOCIAL_SHARE_URL = encodeURIComponent('https://hansslerlaw.com')
const SOCIAL_SHARE_COPY = encodeURIComponent(
  'If debt pressure is escalating, this secure bankruptcy intake helped me get organized fast.',
)

const SOCIAL_LINKS = [
  {
    label: 'Share On Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${SOCIAL_SHARE_URL}`,
  },
  {
    label: 'Share On X',
    href: `https://twitter.com/intent/tweet?text=${SOCIAL_SHARE_COPY}&url=${SOCIAL_SHARE_URL}`,
  },
  {
    label: 'Share By Email',
    href: `mailto:?subject=Secure bankruptcy intake&body=${SOCIAL_SHARE_COPY}%20https://hansslerlaw.com`,
  },
]

const CLIENT_HOOKS = [
  {
    title: 'Fast Start',
    detail: 'Create your account and open a case in minutes, from phone or desktop.',
  },
  {
    title: 'No Guesswork',
    detail: 'Every section explains what is required and blocks vague, incomplete submissions.',
  },
  {
    title: 'Attorney-Reviewed',
    detail: 'Your intake is assembled into a legal review packet before filing.',
  },
  {
    title: 'Privacy First',
    detail: 'Sensitive data is stored in a secure, account-based workflow with audit visibility.',
  },
]

const INDUSTRY_WORKFLOWS = [
  {
    title: 'Court-Compliant Filing Sequence',
    detail: 'Tracks core filing workflow checkpoints and court-order readiness in one path.',
  },
  {
    title: 'Creditor Data Reconciliation',
    detail: 'Compares client disclosures against pulled credit data to catch missed liabilities.',
  },
  {
    title: 'Deadline And Notice Tracking',
    detail: 'Maintains key 341(a), counseling, and notice milestones to prevent avoidable misses.',
  },
  {
    title: 'Trustee Packet Readiness',
    detail: 'Surfaces blockers before submission so the legal team receives a cleaner packet.',
  },
]

export default function Home() {
  return (
    <main>
      <section className="hero hero-split">
        <div className="stack" style={{ gap: '0.75rem' }}>
          <h1>Get Debt Relief Moving Today</h1>
          <p>
            Start a secure intake, answer guided questions, and let the system organize your financial
            story for attorney review. No legal jargon overload. No confusing next steps.
          </p>
          <div className="row">
            <Link className="button" href="/signup">
              Start My Secure Account
            </Link>
            <Link className="button-secondary" href="/login">
              Continue My Intake
            </Link>
          </div>
          <div className="signal-strip">
            <span className="signal-pill">Mobile-Friendly Intake</span>
            <span className="signal-pill">Clear Step-By-Step Guidance</span>
            <span className="signal-pill">Attorney Review Packet</span>
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

      <section className="surface urgency-banner">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>If wages, foreclosure, or collections are escalating, begin intake now.</strong>
          <Link className="button" href="/signup">
            Protect My Timeline
          </Link>
        </div>
      </section>

      <section className="grid-two" style={{ marginBottom: '1.2rem' }}>
        {CLIENT_HOOKS.map((hook) => (
          <article className="surface feature-card" key={hook.title}>
            <h2>{hook.title}</h2>
            <p>{hook.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface process-overview-wrap">
        <div className="stack">
          <h2 style={{ margin: 0 }}>Professional Workflow Engine</h2>
          <p className="hint" style={{ margin: 0 }}>
            Inspired by top bankruptcy case-prep patterns: court workflow controls, credit reconciliation,
            and trustee-readiness gates.
          </p>
          <div className="grid-two">
            {INDUSTRY_WORKFLOWS.map((workflow) => (
              <article className="process-overview-card" key={workflow.title}>
                <h3>{workflow.title}</h3>
                <p>{workflow.detail}</p>
              </article>
            ))}
          </div>
          <div className="row">
            <Link className="button" href="/signup">
              Start My Case
            </Link>
            <Link className="button-secondary" href="/process">
              View Court Process
            </Link>
            <Link className="button-secondary" href="/pricing">
              View Pricing Model
            </Link>
          </div>
        </div>
      </section>

      <ChapterGuides />

      <section className="surface social-proof-wrap">
        <div className="stack">
          <h2 style={{ margin: 0 }}>Help Someone Start Their Relief Plan</h2>
          <p className="hint" style={{ margin: 0 }}>
            Share this intake portal with a friend or family member who needs a structured path forward.
          </p>
          <div className="row social-share-row">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                className="share-chip"
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
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
