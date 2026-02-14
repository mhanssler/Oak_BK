'use client'

import { useState } from 'react'

type GuideId = 'chapter7' | 'chapter13'

interface ChapterGuide {
  id: GuideId
  chapterLabel: string
  petName: string
  prompt: string
  summary: string
}

const CHAPTER_GUIDES: ChapterGuide[] = [
  {
    id: 'chapter7',
    chapterLabel: 'Chapter 7',
    petName: 'Bruno the Dog',
    prompt: 'Tap Bruno to hear how Chapter 7 works',
    summary:
      'Chapter 7 is often the faster option. It can discharge qualifying unsecured debts, usually in a few months, after income and eligibility checks are reviewed by your attorney.',
  },
  {
    id: 'chapter13',
    chapterLabel: 'Chapter 13',
    petName: 'Cleo the Cat',
    prompt: 'Tap Cleo to hear how Chapter 13 works',
    summary:
      'Chapter 13 uses a court-approved repayment plan, usually 3 to 5 years. It is often used when you need time to catch up on secured debt or when Chapter 7 is not the right fit.',
  },
]

function DogAvatar({ active }: { active: boolean }) {
  return (
    <svg className="guide-avatar-svg" viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="24" cy="35" rx="12" ry="16" fill="#7d5a45" />
      <ellipse cx="96" cy="35" rx="12" ry="16" fill="#7d5a45" />
      <circle cx="60" cy="60" r="34" fill="#ad7e61" />
      <circle cx="47" cy="56" r="4" fill="#12222a" />
      <circle cx="73" cy="56" r="4" fill="#12222a" />
      <ellipse cx="60" cy="74" rx="16" ry="12" fill="#f3ddc8" />
      <ellipse cx="60" cy="69" rx="7" ry="5" fill="#2b2927" />
      <rect
        className={`guide-mouth ${active ? 'guide-mouth-active' : ''}`}
        x="54"
        y="79"
        width="12"
        height="5"
        rx="3"
        fill="#3a201d"
      />
    </svg>
  )
}

function CatAvatar({ active }: { active: boolean }) {
  return (
    <svg className="guide-avatar-svg" viewBox="0 0 120 120" aria-hidden="true">
      <polygon points="30,22 44,44 20,44" fill="#6a7483" />
      <polygon points="90,22 100,44 76,44" fill="#6a7483" />
      <circle cx="60" cy="60" r="34" fill="#7b8798" />
      <circle cx="47" cy="57" r="4" fill="#14202a" />
      <circle cx="73" cy="57" r="4" fill="#14202a" />
      <polygon points="60,67 55,74 65,74" fill="#f2bcc2" />
      <rect
        className={`guide-mouth ${active ? 'guide-mouth-active' : ''}`}
        x="54"
        y="78"
        width="12"
        height="5"
        rx="3"
        fill="#2f1d20"
      />
      <line x1="34" y1="73" x2="50" y2="71" stroke="#404c5a" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="79" x2="50" y2="79" stroke="#404c5a" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="73" x2="70" y2="71" stroke="#404c5a" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="79" x2="70" y2="79" stroke="#404c5a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ChapterGuides() {
  const [activeGuide, setActiveGuide] = useState<GuideId | null>(null)

  function handleToggle(guideId: GuideId) {
    setActiveGuide((previous) => (previous === guideId ? null : guideId))
  }

  return (
    <section className="surface chapter-guides-wrap">
      <div className="stack">
        <h2 style={{ margin: 0 }}>Meet Your Chapter Guides</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          Tap a guide to hear a quick, plain-English explanation.
        </p>

        <div className="chapter-guides-grid">
          {CHAPTER_GUIDES.map((guide) => {
            const isActive = activeGuide === guide.id
            return (
              <article
                key={guide.id}
                className={`chapter-guide-card ${isActive ? 'chapter-guide-card-active' : ''}`}
              >
                <button
                  type="button"
                  className="chapter-guide-trigger"
                  onClick={() => handleToggle(guide.id)}
                  aria-expanded={isActive}
                >
                  <div className="chapter-guide-avatar">
                    {guide.id === 'chapter7' ? (
                      <DogAvatar active={isActive} />
                    ) : (
                      <CatAvatar active={isActive} />
                    )}
                  </div>
                  <div className="stack" style={{ gap: '0.35rem' }}>
                    <strong>
                      {guide.petName}: {guide.chapterLabel}
                    </strong>
                    <span className="hint">{guide.prompt}</span>
                  </div>
                </button>

                <div
                  className={`chapter-guide-bubble ${isActive ? 'chapter-guide-bubble-open' : ''}`}
                  aria-hidden={!isActive}
                >
                  <p>{guide.summary}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
