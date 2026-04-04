import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://scanmyprivacy.com'),
  title: {
    default: 'ScanMyPrivacy - Personal Privacy & Website Compliance Scanner',
    template: '%s | ScanMyPrivacy',
  },
  description: 'Scan your personal privacy and audit your website for GDPR/CCPA compliance. Free tools for individuals and businesses. IP leak detection, browser fingerprinting, cookie consent audits, and compliance reports.',
  keywords: ['privacy scanner', 'GDPR compliance', 'CCPA compliance', 'IP leak test', 'browser fingerprinting', 'cookie consent', 'website audit', 'privacy tools', 'data protection', 'GDPR fine', 'privacy check', 'online privacy', 'VPN test', 'DNS leak test', 'WebRTC leak', 'privacy score'],
  authors: [{ name: 'ScanMyPrivacy' }],
  creator: 'ScanMyPrivacy',
  publisher: 'ScanMyPrivacy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scanmyprivacy.com',
    siteName: 'ScanMyPrivacy',
    title: 'ScanMyPrivacy - Personal Privacy & Website Compliance Scanner',
    description: 'Scan your personal privacy and audit your website for GDPR/CCPA compliance. Free tools for individuals and businesses.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ScanMyPrivacy - Complete Privacy Protection Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanMyPrivacy - Personal Privacy & Website Compliance Scanner',
    description: 'Scan your personal privacy and audit your website for GDPR/CCPA compliance.',
    creator: '@scanmyprivacy',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://scanmyprivacy.com',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ScanMyPrivacy',
              url: 'https://scanmyprivacy.com',
              logo: 'https://scanmyprivacy.com/logo.png',
              description: 'Personal privacy scanner and website compliance auditing platform',
              sameAs: [
                'https://twitter.com/scanmyprivacy',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ScanMyPrivacy',
              url: 'https://scanmyprivacy.com',
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
