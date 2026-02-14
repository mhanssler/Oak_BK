import type { Metadata } from 'next'
import { Archivo, Bitter } from 'next/font/google'
import './globals.css'

const bodyFont = Archivo({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const headingFont = Bitter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hanssler Law - Bankruptcy Intake',
  description: 'Secure bankruptcy intake and trustee packet preparation workflow.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  )
}
