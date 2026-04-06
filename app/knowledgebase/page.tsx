'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

const knowledgebase = [
  {
    category: 'GDPR',
    icon: '🇪🇺',
    articles: [
      { title: 'What is GDPR?', slug: 'what-is-gdpr', readTime: '5 min' },
      { title: 'GDPR Checklist for Websites', slug: 'gdpr-checklist', readTime: '8 min' },
      { title: 'Data Subject Rights', slug: 'data-subject-rights', readTime: '6 min' },
      { title: 'Legitimate Interest Assessment', slug: 'legitimate-interest', readTime: '10 min' },
      { title: 'GDPR Fines and Penalties', slug: 'gdpr-fines', readTime: '4 min' },
    ],
  },
  {
    category: 'CCPA/CPRA',
    icon: '🇺🇸',
    articles: [
      { title: 'CCPA vs CPRA: What Changed?', slug: 'ccpa-vs-cpra', readTime: '7 min' },
      { title: 'California Privacy Rights', slug: 'california-privacy-rights', readTime: '5 min' },
      { title: 'Opt-out vs Opt-in', slug: 'opt-out-opt-in', readTime: '4 min' },
      { title: 'Service Provider Agreements', slug: 'service-provider-agreements', readTime: '8 min' },
    ],
  },
  {
    category: 'Cookies',
    icon: '🍪',
    articles: [
      { title: 'Types of Cookies Explained', slug: 'types-of-cookies', readTime: '5 min' },
      { title: 'First-Party vs Third-Party', slug: 'first-vs-third-party', readTime: '4 min' },
      { title: 'Essential vs Non-Essential', slug: 'essential-cookies', readTime: '6 min' },
      { title: 'Cookie Consent Requirements', slug: 'cookie-consent-requirements', readTime: '7 min' },
    ],
  },
  {
    category: 'Security',
    icon: '🔒',
    articles: [
      { title: 'HTTPS Implementation Guide', slug: 'https-guide', readTime: '6 min' },
      { title: 'Security Headers Explained', slug: 'security-headers', readTime: '8 min' },
      { title: 'Content Security Policy', slug: 'content-security-policy', readTime: '10 min' },
      { title: 'XSS Prevention', slug: 'xss-prevention', readTime: '7 min' },
    ],
  },
  {
    category: 'Privacy',
    icon: '🔐',
    articles: [
      { title: 'Browser Fingerprinting', slug: 'browser-fingerprinting', readTime: '6 min' },
      { title: 'VPN vs Proxy vs Tor', slug: 'vpn-proxy-tor', readTime: '8 min' },
      { title: 'Encrypted DNS (DoH/DoT)', slug: 'encrypted-dns', readTime: '5 min' },
      { title: 'Private Browsing Myths', slug: 'private-browsing', readTime: '4 min' },
    ],
  },
  {
    category: 'Compliance',
    icon: '✅',
    articles: [
      { title: 'Privacy Policy Checklist', slug: 'privacy-policy-checklist', readTime: '6 min' },
      { title: 'Terms of Service Essentials', slug: 'terms-of-service', readTime: '7 min' },
      { title: 'Cookie Policy Template', slug: 'cookie-policy-template', readTime: '5 min' },
      { title: 'Data Processing Agreement', slug: 'data-processing-agreement', readTime: '9 min' },
    ],
  },
];

const externalResources = [
  {
    name: 'GDPR.eu',
    url: 'https://gdpr.eu/',
    description: 'Official GDPR resource with full regulation text',
  },
  {
    name: 'California Attorney General - CCPA',
    url: 'https://oag.ca.gov/privacy/ccpa',
    description: 'Official CCPA guidance from California DOJ',
  },
  {
    name: 'ICO UK',
    url: 'https://ico.org.uk/',
    description: 'UK Information Commissioner\'s Office',
  },
  {
    name: 'CNIL France',
    url: 'https://www.cnil.fr/',
    description: 'French data protection authority',
  },
  {
    name: 'NIST Cybersecurity',
    url: 'https://www.nist.gov/cybersecurity',
    description: 'US National Institute of Standards and Technology',
  },
  {
    name: 'OWASP',
    url: 'https://owasp.org/',
    description: 'Open Web Application Security Project',
  },
];

export default function KnowledgebasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKB = knowledgebase.map(cat => ({
    ...cat,
    articles: cat.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.articles.length > 0);

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy & Security Knowledgebase</h1>
          <p className="text-slate-400">Comprehensive guides on GDPR, CCPA, security best practices, and digital privacy</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(searchQuery ? filteredKB : knowledgebase).map((category) => (
            <div key={category.category} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-semibold">{category.category}</h2>
                <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">
                  {category.articles.length} articles
                </span>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/knowledgebase/${article.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700 transition-colors group"
                    >
                      <span className="text-sm text-slate-300 group-hover:text-white">
                        {article.title}
                      </span>
                      <span className="text-xs text-slate-500">{article.readTime}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* External Resources */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">🔗 Official Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalResources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener"
                className="p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <h4 className="font-medium text-blue-400 mb-1">{resource.name}</h4>
                <p className="text-xs text-slate-500">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/50">
          <h2 className="text-xl font-semibold mb-4">📚 Quick Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-purple-400 mb-2">GDPR</h4>
              <p className="text-slate-400">General Data Protection Regulation - EU law protecting personal data</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-2">CCPA</h4>
              <p className="text-slate-400">California Consumer Privacy Act - US state privacy law</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-2">DPO</h4>
              <p className="text-slate-400">Data Protection Officer - Required for certain organizations</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-2">PII</h4>
              <p className="text-slate-400">Personally Identifiable Information - Data that identifies individuals</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
