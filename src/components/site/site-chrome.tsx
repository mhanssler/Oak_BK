'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const SECURE_PATH_PREFIXES = ['/dashboard', '/intake', '/review', '/admin']

function isSecurePath(pathname: string): boolean {
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
            <Image src="/mighty_oak.png" alt="Oak emblem" width={34} height={34} />
            <span>Oak Bankruptcy Intake</span>
          </Link>
          <nav className="row public-nav">
            <Link className="button-secondary" href="/login">
              Sign In
            </Link>
            <Link className="button" href="/signup">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      <div className="public-body">{children}</div>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <strong>Oak Bankruptcy Intake</strong>
            <span className="hint">Secure client intake and attorney-reviewed filing preparation.</span>
          </div>
          <div className="row public-footer-links">
            <Link className="hint" href="/login">
              Sign In
            </Link>
            <Link className="hint" href="/signup">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
