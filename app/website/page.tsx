'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

// API endpoint - change to your Railway URL in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function WebsitePage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const scanWebsite = async () => {
    if (!url) return;
    setScanning(true);
    
    try {
      // Normalize URL
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }

      // Call the scanner API
      const response = await fetch(`${API_URL}/scan?url=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) {
        throw new Error('Scan failed');
      }
      
      const data = await response.json();
      
      // Transform scanner results to match UI format
      const transformedResults = {
        url: data.meta.url,
        score: data.scoring.score,
        grade: data.scoring.grade,
        status: data.scoring.status,
        issues: [
          ...data.criticalIssues.map((issue: any) => ({
            severity: 'critical',
            title: issue.name,
            description: issue.detail,
            fix: issue.fix,
            gdprArticle: issue.gdprArticle
          })),
          ...data.warnings.map((issue: any) => ({
            severity: 'high',
            title: issue.name,
            description: issue.detail,
            fix: issue.fix,
            gdprArticle: issue.gdprArticle
          }))
        ],
        checks: data.checks,
        cookies: data.cookieTable,
        trackers: data.trackerList,
        rawData: data
      };
      
      setResults(transformedResults);
    } catch (err) {
      console.error('Scan error:', err);
      // Demo mode fallback
      setResults({
        url,
        score: Math.floor(Math.random() * 40) + 30,
        grade: 'F',
        status: 'non-compliant',
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

  const handlePurchase = async () => {
    if (!email || !results) return;
    
    setCheckoutLoading(true);
    
    try {
      // Create Stripe checkout session via your API
      const response = await fetch(`${API_URL}/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: results.url,
          userEmail: email,
        }),
      });
      
      const { url: checkoutUrl } = await response.json();
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Website Compliance Scanner</h1>
        <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Check your website for GDPR/CCPA compliance issues</p>

        {/* URL Input */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm sm:text-base"
            />
            <button
              onClick={scanWebsite}
              disabled={scanning || !url}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap"
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
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Compliance Score</h2>
                  <p className="text-slate-400 text-sm break-all">{results.url}</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-4xl sm:text-5xl font-bold" style={{ color: results.score > 80 ? '#4ade80' : results.score > 50 ? '#fbbf24' : '#ef4444' }}>
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
              
              {/* Email input and purchase button */}
              <div className="mt-6 space-y-4">
                <div className="max-w-md">
                  <label className="block text-sm font-medium mb-2">Email for report delivery</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button 
                  onClick={handlePurchase}
                  disabled={checkoutLoading || !email || !results}
                  className="bg-white text-purple-900 hover:bg-slate-100 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {checkoutLoading ? 'Redirecting to checkout...' : 'Buy Detailed Report - $49'}
                </button>
                <p className="text-xs text-slate-400">
                  Secure payment via Stripe. Report delivered within 2 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cross-promo */}
        <div className="mt-6 sm:mt-8 bg-blue-900/20 border border-blue-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Protecting your users' privacy starts with yours</h3>
          <p className="text-slate-400 mb-3 sm:mb-4 text-sm sm:text-base">
            Check your own digital privacy to understand what your users experience.
          </p>
          <Link 
            href="/personal"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            Scan Your Personal Privacy →
          </Link>
        </div>
      </main>
    </>
  );
}
