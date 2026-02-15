import Link from 'next/link'

type GuideId = 'chapter7' | 'chapter13'

interface ChapterGuide {
  id: GuideId
  chapterLabel: string
  petName: string
  videoSrc: string
  summary: string
}

const CHAPTER_GUIDES: ChapterGuide[] = [
  {
    id: 'chapter7',
    chapterLabel: 'Chapter 7',
    petName: 'Bruno the Dog',
    videoSrc: '/videos/chapter-7-dog.mp4',
    summary:
      'Chapter 7 is often the faster option and can discharge qualifying unsecured debts after eligibility review.',
  },
  {
    id: 'chapter13',
    chapterLabel: 'Chapter 13',
    petName: 'Cleo the Cat',
    videoSrc: '/videos/chapter-13-cat.mp4',
    summary:
      'Chapter 13 uses a court-approved repayment plan, usually 3 to 5 years, when a reorganization path is needed.',
  },
]

export function ChapterGuides() {
  return (
    <section className="surface chapter-guides-wrap">
      <div className="stack">
        <h2 style={{ margin: 0 }}>Meet Your Chapter Guides</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          Watch a short video explanation, then start your secure intake to move forward.
        </p>

        <div className="chapter-guides-grid">
          {CHAPTER_GUIDES.map((guide) => {
            return (
              <article key={guide.id} className="chapter-guide-card">
                <div className="chapter-guide-head">
                  <strong>{guide.petName}</strong>
                  <span className="chapter-guide-badge">{guide.chapterLabel}</span>
                </div>

                <div className="chapter-guide-video-frame">
                  <video className="chapter-guide-video" controls preload="metadata" playsInline>
                    <source src={guide.videoSrc} type="video/mp4" />
                    Your browser does not support this video.
                  </video>
                </div>

                <p>{guide.summary}</p>

                <div className="row chapter-guide-actions">
                  <Link className="button" href="/signup">
                    Start Secure Intake
                  </Link>
                  <Link className="button-secondary" href="/login">
                    Continue Intake
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
