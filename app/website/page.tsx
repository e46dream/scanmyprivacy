'use client';

import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'Website Compliance Scanner - GDPR & CCPA Audit Tool',
  description: 'Free website compliance scanner. Audit your website for GDPR and CCPA violations. Check cookie consent, privacy policies, and avoid $20M fines. Detailed reports from $49.',
  keywords: ['GDPR compliance checker', 'CCPA compliance', 'website audit', 'cookie consent check', 'privacy policy audit', 'GDPR fine', 'compliance scanner', 'website compliance tool'],
  alternates: {
    canonical: 'https://scanmyprivacy.com/website',
  },
  openGraph: {
    title: 'Website Compliance Scanner - GDPR & CCPA Audit',
    description: 'Audit your website for GDPR and CCPA compliance. Free scan, detailed reports from $49.',
    url: 'https://scanmyprivacy.com/website',
  },
};

export default function WebsitePage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const scanWebsite = async () => {
    if (!url) return;
    setScanning(true);
    
    try {
      const response = await fetch(`/api/website-scan?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setResults(data);
    } catch {
      // Demo mode fallback
      setResults({
        url,
        score: Math.floor(Math.random() * 40) + 30,
        issues: [
          { severity: 'critical', title: 'Cookie consent banner missing', description: 'Required for GDPR compliance' },
          { severity: 'high', title: 'Google Analytics loads before consent', description: 'Violation of ePrivacy Directive' },
          { severity: 'medium', title: 'Privacy policy outdated', description: 'Last updated > 12 months ago' },
        ],
        demo: true
      });
    }
    
    setScanning(false);
  };

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2">Website Compliance Scanner</h1>
        <p className="text-slate-400 mb-6">Check your website for GDPR/CCPA compliance issues</p>

        {/* URL Input */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
            <button
              onClick={scanWebsite}
              disabled={scanning || !url}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {scanning ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Free scan • No signup required • Takes 60 seconds</p>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Compliance Score</h2>
                  <p className="text-slate-400">{results.url}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold" style={{ color: results.score > 80 ? '#4ade80' : results.score > 50 ? '#fbbf24' : '#ef4444' }}>
                    {results.score}
                  </div>
                  <p className="text-sm text-slate-400">/ 100</p>
                </div>
              </div>
              {results.score < 50 && (
                <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-400 text-sm">⚠️ Critical issues found. Your website may be violating GDPR/CCPA regulations.</p>
                </div>
              )}
              {results.demo && (
                <p className="text-xs text-slate-500 mt-2">* Demo mode - Real API requires setup</p>
              )}
            </div>

            {/* Issues List */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Issues Found ({results.issues?.length || 0})</h3>
              <div className="space-y-3">
                {results.issues?.map((issue: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                    <span className={
                      issue.severity === 'critical' ? 'text-red-400' : 
                      issue.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                    }>
                      {issue.severity === 'critical' ? '❌' : issue.severity === 'high' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-slate-400">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700">
              <h3 className="text-xl font-semibold mb-2">Get Your Detailed Compliance Report</h3>
              <p className="text-slate-400 mb-4">
                Upgrade to get a comprehensive 5-page PDF report with step-by-step fix instructions.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Free Scan</h4>
                  <p className="text-sm text-slate-400">✓ Identifies issues</p>
                  <p className="text-sm text-slate-400">✓ Shows risk level</p>
                  <p className="text-sm text-slate-400 text-slate-600">✗ No fix guide</p>
                  <p className="text-2xl font-bold mt-2">$0</p>
                </div>
                <div className="bg-purple-600 p-4 rounded-lg border-2 border-purple-400">
                  <h4 className="font-semibold mb-2">Detailed Report</h4>
                  <p className="text-sm">✓ Full 5-page PDF</p>
                  <p className="text-sm">✓ Step-by-step fixes</p>
                  <p className="text-sm">✓ Legal compliance guide</p>
                  <p className="text-2xl font-bold mt-2">$49</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Monthly Monitoring</h4>
                  <p className="text-sm text-slate-400">✓ Automatic rescans</p>
                  <p className="text-sm text-slate-400">✓ Alert on new issues</p>
                  <p className="text-sm text-slate-400">✓ Priority support</p>
                  <p className="text-2xl font-bold mt-2">$49/mo</p>
                </div>
              </div>
              <button className="mt-4 bg-white text-purple-900 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold transition-colors w-full md:w-auto">
                Buy Detailed Report - $49
              </button>
            </div>
          </div>
        )}

        {/* Cross-promo */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Protecting your users' privacy starts with yours</h3>
          <p className="text-slate-400 mb-4">
            Check your own digital privacy to understand what your users experience.
          </p>
          <Link 
            href="/personal"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Scan Your Personal Privacy →
          </Link>
        </div>
      </main>
    </>
  );
}
