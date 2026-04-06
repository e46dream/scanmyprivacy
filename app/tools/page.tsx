'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

const tools = [
  {
    title: 'Website Compliance Scanner',
    description: 'Scan your website for GDPR, CCPA, and cookie compliance issues.',
    icon: '🌐',
    href: '/website',
    category: 'Compliance',
    featured: true,
  },
  {
    title: 'Personal Privacy Scanner',
    description: 'Check your IP address, WebRTC leaks, and browser fingerprint.',
    icon: '👤',
    href: '/personal',
    category: 'Privacy',
    featured: true,
  },
  {
    title: 'IP Leak Test',
    description: 'Detect if your VPN is leaking your real IP address through WebRTC.',
    icon: '🕵️',
    href: '/personal/ip-leak',
    category: 'Privacy',
  },
  {
    title: 'Browser Fingerprint',
    description: 'See how unique your browser fingerprint is for tracking.',
    icon: '👆',
    href: '/personal/fingerprint',
    category: 'Privacy',
  },
  {
    title: 'DNS Leak Check',
    description: 'Verify your DNS queries aren\'t leaking outside your VPN.',
    icon: '🔍',
    href: '/personal/dns-leak',
    category: 'Privacy',
  },
];

const externalTools = [
  {
    title: 'Have I Been Pwned',
    description: 'Check if your email has been in a data breach',
    url: 'https://haveibeenpwned.com/',
    icon: '🔓',
    provider: 'Troy Hunt',
  },
  {
    title: 'VirusTotal',
    description: 'Scan files and URLs for malware',
    url: 'https://www.virustotal.com/',
    icon: '🦠',
    provider: 'Google',
  },
  {
    title: 'PrivacyTools.io',
    description: 'Privacy-focused software recommendations',
    url: 'https://www.privacytools.io/',
    icon: '🛠️',
    provider: 'Privacy Community',
  },
  {
    title: 'SSL Labs Test',
    description: 'Test your SSL/TLS configuration',
    url: 'https://www.ssllabs.com/ssltest/',
    icon: '🔒',
    provider: 'Qualys',
  },
  {
    title: 'Security Headers',
    description: 'Check your website security headers',
    url: 'https://securityheaders.com/',
    icon: '📋',
    provider: 'Scott Helme',
  },
  {
    title: 'Mozilla Observatory',
    description: 'Website security scan by Mozilla',
    url: 'https://observatory.mozilla.org/',
    icon: '🦊',
    provider: 'Mozilla',
  },
  {
    title: '2FA Directory',
    description: 'Find which services support 2FA',
    url: 'https://2fa.directory/',
    icon: '🔐',
    provider: '2FA Community',
  },
  {
    title: 'Privacy Score',
    description: 'Check website tracking practices',
    url: 'https://privacyscore.org/',
    icon: '📊',
    provider: 'PrivacyScore',
  },
];

export default function ToolsPage() {
  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Privacy & Security Tools</h1>
          <p className="text-slate-400">Free tools to check your privacy and secure your digital life</p>
        </div>

        {/* Featured Tools */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-purple-400">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.filter(t => t.featured).map(tool => (
              <Link
                key={tool.title}
                href={tool.href}
                className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/50 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{tool.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{tool.description}</p>
                    <span className="inline-block mt-3 text-xs bg-purple-600/50 text-purple-300 px-2 py-1 rounded">
                      {tool.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Our Tools */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">All Our Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <Link
                key={tool.title}
                href={tool.href}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition-colors group"
              >
                <span className="text-2xl mb-3 block">{tool.icon}</span>
                <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* External Tools */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-green-400">Recommended External Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {externalTools.map(tool => (
              <a
                key={tool.title}
                href={tool.url}
                target="_blank"
                rel="noopener"
                className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-green-500 transition-colors group"
              >
                <span className="text-2xl mb-3 block">{tool.icon}</span>
                <h3 className="font-semibold mb-1 group-hover:text-green-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-xs mb-2">{tool.description}</p>
                <span className="text-xs text-slate-500">via {tool.provider}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-700/50 text-center">
          <h3 className="text-xl font-semibold mb-3">Need a Detailed Website Audit?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Get a comprehensive 5-page PDF report covering GDPR compliance, cookie analysis, 
            security headers, and actionable fix recommendations.
          </p>
          <Link
            href="/website"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
          >
            Start Website Scan →
          </Link>
        </div>
      </main>
    </>
  );
}
