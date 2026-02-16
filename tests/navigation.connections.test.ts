import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const STATIC_PUBLIC_ROUTES = new Set([
  '/',
  '/faq',
  '/login',
  '/signup',
  '/process',
  '/pricing',
  '/signup/verify',
  '/auth/confirmed',
])

function getQuotedInternalHrefs(relativeFilePath: string): string[] {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath)
  const source = readFileSync(absolutePath, 'utf8')
  const matches = source.match(/href="(\/[^"]*)"/g) || []
  return matches.map((match) => match.replace(/^href="/, '').replace(/"$/, ''))
}

function getVideoSources(relativeFilePath: string): string[] {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath)
  const source = readFileSync(absolutePath, 'utf8')
  const matches = source.match(/videoSrc:\s*'(\/videos\/[^']+)'/g) || []
  return matches.map((match) => match.replace(/^videoSrc:\s*'/, '').replace(/'$/, ''))
}

function getSecurePrefixes(relativeFilePath: string): string[] {
  const absolutePath = path.resolve(process.cwd(), relativeFilePath)
  const source = readFileSync(absolutePath, 'utf8')
  const matches = source.match(/'\/(dashboard|intake|review|admin)'/g) || []
  return matches.map((match) => match.replace(/'/g, ''))
}

describe('navigation and connection features', () => {
  it('keeps chapter guide media assets available', () => {
    const videoSources = getVideoSources('src/components/home/chapter-guides.tsx')
    expect(videoSources.length).toBeGreaterThanOrEqual(2)

    for (const videoSrc of videoSources) {
      const filePath = path.resolve(process.cwd(), `public${videoSrc}`)
      expect(existsSync(filePath)).toBe(true)
    }
  })

  it('only links homepage/chrome call-to-actions to valid public routes', () => {
    const filesToCheck = [
      'src/app/page.tsx',
      'src/components/site/site-chrome.tsx',
      'src/components/home/chapter-guides.tsx',
    ]
    const links = filesToCheck.flatMap((filePath) => getQuotedInternalHrefs(filePath))

    for (const link of links) {
      expect(STATIC_PUBLIC_ROUTES.has(link)).toBe(true)
    }
  })

  it('includes all secure prefixes in chrome visibility logic', () => {
    const prefixes = getSecurePrefixes('src/components/site/site-chrome.tsx')
    expect(prefixes).toEqual(['/dashboard', '/intake', '/review', '/admin'])
  })
})
