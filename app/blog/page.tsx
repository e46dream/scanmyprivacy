'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

const articles = [
  {
    id: 'gdpr-compliance-guide',
    title: 'GDPR Compliance Guide for Websites',
    excerpt: 'A comprehensive guide to understanding and implementing GDPR requirements for your website, including cookie consent, data processing, and user rights.',
    category: 'Compliance',
    readTime: '8 min read',
    date: 'Dec 15, 2024',
    icon: '📋',
  },
  {
    id: 'cookie-consent-best-practices',
    title: 'Cookie Consent Banner Best Practices',
    excerpt: 'Learn how to implement user-friendly cookie consent banners that comply with regulations while maintaining good user experience.',
    category: 'UX & Legal',
    readTime: '6 min read',
    date: 'Dec 10, 2024',
    icon: '🍪',
  },
  {
    id: 'ccpa-vs-gdpr',
    title: 'CCPA vs GDPR: Key Differences',
    excerpt: 'Understanding the differences between California Consumer Privacy Act and General Data Protection Regulation for global compliance.',
    category: 'Legal',
    readTime: '10 min read',
    date: 'Dec 5, 2024',
    icon: '⚖️',
  },
  {
    id: 'third-party-trackers',
    title: 'The Hidden World of Third-Party Trackers',
    excerpt: 'How advertising networks and analytics tools track users across the web, and what you need to disclose to your visitors.',
    category: 'Privacy',
    readTime: '7 min read',
    date: 'Nov 28, 2024',
    icon: '👁️',
  },
  {
    id: 'secure-website-checklist',
    title: 'Website Security Checklist 2024',
    excerpt: 'Essential security measures every website owner should implement: HTTPS, security headers, CSP, and more.',
    category: 'Security',
    readTime: '12 min read',
    date: 'Nov 20, 2024',
    icon: '🔒',
  },
  {
    id: 'privacy-policy-essentials',
    title: 'Privacy Policy Essentials',
    excerpt: 'What your privacy policy must include to be legally compliant and build trust with your users.',
    category: 'Legal',
    readTime: '5 min read',
    date: 'Nov 15, 2024',
    icon: '📄',
  },
  {
    id: 'data-breach-prevention',
    title: 'Data Breach Prevention Strategies',
    excerpt: 'Proactive measures to protect user data and prevent costly security breaches on your website.',
    category: 'Security',
    readTime: '9 min read',
    date: 'Nov 8, 2024',
    icon: '🛡️',
  },
  {
    id: 'vpn-guide-2024',
    title: 'VPN Guide: Protecting Your Digital Footprint',
    excerpt: 'Everything you need to know about VPNs: how they work, what to look for, and top recommendations for 2024.',
    category: 'Privacy',
    readTime: '11 min read',
    date: 'Nov 1, 2024',
    icon: '🔐',
  },
  {
    id: 'browser-fingerprinting',
    title: 'Browser Fingerprinting Explained',
    excerpt: 'How websites uniquely identify you without cookies, and techniques to protect your anonymity online.',
    category: 'Privacy',
    readTime: '8 min read',
    date: 'Oct 25, 2024',
    icon: '👆',
  },
];

const categories = ['All', 'Security', 'Privacy', 'Legal', 'Compliance', 'UX & Legal'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Security & Privacy Blog</h1>
          <p className="text-slate-400">Expert insights on cybersecurity, privacy regulations, and digital protection</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <Link 
              key={article.id}
              href={`/blog/${article.id}`}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{article.icon}</span>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                  {article.category}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* External Resources */}
        <div className="mt-12 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">🔗 Trusted External Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a 
              href="https://www.eff.org/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">🔒</span>
              <div>
                <h4 className="font-medium text-blue-400">EFF</h4>
                <p className="text-xs text-slate-500">Electronic Frontier Foundation</p>
              </div>
            </a>
            <a 
              href="https://www.bleepingcomputer.com/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">💻</span>
              <div>
                <h4 className="font-medium text-green-400">Bleeping Computer</h4>
                <p className="text-xs text-slate-500">Cybersecurity News</p>
              </div>
            </a>
            <a 
              href="https://krebsonsecurity.com/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">🔍</span>
              <div>
                <h4 className="font-medium text-orange-400">Krebs on Security</h4>
                <p className="text-xs text-slate-500">In-depth Investigations</p>
              </div>
            </a>
            <a 
              href="https://www.schneier.com/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">📚</span>
              <div>
                <h4 className="font-medium text-purple-400">Schneier on Security</h4>
                <p className="text-xs text-slate-500">Bruce Schneier's Blog</p>
              </div>
            </a>
            <a 
              href="https://thehackernews.com/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">📰</span>
              <div>
                <h4 className="font-medium text-red-400">The Hacker News</h4>
                <p className="text-xs text-slate-500">Cybersecurity News</p>
              </div>
            </a>
            <a 
              href="https://www.ncsc.gov.uk/" 
              target="_blank" 
              rel="noopener"
              className="flex items-center p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <span className="text-2xl mr-3">🇬🇧</span>
              <div>
                <h4 className="font-medium text-teal-400">NCSC UK</h4>
                <p className="text-xs text-slate-500">National Cyber Security Centre</p>
              </div>
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Stay Updated</h3>
              <p className="text-slate-400 text-sm">Get the latest privacy tips and security alerts delivered to your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="your@email.com"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
              />
              <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
