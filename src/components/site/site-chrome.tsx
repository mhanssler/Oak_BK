'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SECURE_PATH_PREFIXES = ['/dashboard', '/intake', '/review', '/admin']

export function isSecurePath(pathname: string): boolean {
  return SECURE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const safePathname = typeof pathname === 'string' ? pathname : ''
  const hidePublicChrome = isSecurePath(safePathname)

  if (hidePublicChrome) {
    return <>{children}</>
  }

  return (
    <div className="site-shell">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/" className="brand-lockup">
            <span>Bankruptcy Intake Portal</span>
          </Link>
          <nav className="row public-nav">
            <Link className="hint" href="/faq">
              View FAQ
            </Link>
            <Link className="hint" href="/process">
              View Process
            </Link>
            <Link className="hint" href="/pricing">
              View Pricing
            </Link>
            <Link className="button-secondary" href="/login">
              Continue Intake
            </Link>
            <Link className="button" href="/signup">
              Start Intake
            </Link>
          </nav>
        </div>
      </header>

      <div className="public-body">{children}</div>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <strong>Bankruptcy Intake Portal</strong>
            <span className="hint">Secure client intake and attorney-reviewed filing preparation.</span>
          </div>
          <div className="row public-footer-links">
            <Link className="hint" href="/faq">
              View FAQ
            </Link>
            <Link className="hint" href="/process">
              View Process
            </Link>
            <Link className="hint" href="/pricing">
              View Pricing
            </Link>
            <Link className="hint" href="/login">
              Continue Intake
            </Link>
            <Link className="hint" href="/signup">
              Start Intake
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
