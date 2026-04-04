import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScanMyPrivacy - Personal Privacy & Website Compliance Scanner',
  description: 'Scan your personal privacy and audit your website for GDPR/CCPA compliance. Free tools for individuals and businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
