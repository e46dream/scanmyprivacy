import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - Free Personal Scanner & Paid Website Compliance Reports',
  description: 'ScanMyPrivacy pricing. Personal privacy scanner is 100% free. Website compliance reports from $49. Monthly monitoring from $49/month. GDPR & CCPA compliance made affordable.',
  keywords: ['privacy scanner pricing', 'GDPR compliance cost', 'CCPA audit price', 'website compliance pricing', 'free privacy tools', 'compliance reports'],
  alternates: {
    canonical: 'https://scanmyprivacy.com/pricing',
  },
  openGraph: {
    title: 'ScanMyPrivacy Pricing - Free & Paid Plans',
    description: 'Free personal privacy scanner. Website compliance reports from $49. Monthly monitoring available.',
    url: 'https://scanmyprivacy.com/pricing',
  },
};

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-400">Choose the plan that works for your business</p>
        </div>

        {/* B2C - Personal (Free) */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center">Personal Privacy Protection (100% Free)</h2>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Personal Privacy Scanner</h3>
                <ul className="text-slate-400 text-sm mt-2 space-y-1">
                  <li>✓ IP Leak Detection</li>
                  <li>✓ Browser Fingerprint Analysis</li>
                  <li>✓ DNS Leak Check</li>
                  <li>✓ WebRTC Security Test</li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">Free</p>
                <p className="text-sm text-slate-500">Forever</p>
                <Link 
                  href="/personal"
                  className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start Scanning
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* B2B - Website Compliance */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-center">Website Compliance (B2B)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Scan */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-2">Free Scan</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="text-slate-400 text-sm space-y-2 mb-6">
                <li>✓ Identify compliance issues</li>
                <li>✓ Overall risk score</li>
                <li>✓ 10-point checklist</li>
                <li className="text-slate-600">✗ No detailed report</li>
                <li className="text-slate-600">✗ No fix instructions</li>
              </ul>
              <Link 
                href="/website"
                className="block text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
              >
                Scan Free
              </Link>
            </div>

            {/* Detailed Report */}
            <div className="bg-purple-600 rounded-xl p-6 border-2 border-purple-400 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
              <h3 className="text-lg font-semibold mb-2">Detailed Report</h3>
              <p className="text-3xl font-bold mb-4">$49</p>
              <p className="text-sm text-purple-200 mb-4">One-time purchase</p>
              <ul className="text-sm space-y-2 mb-6">
                <li>✓ Full 5-page PDF report</li>
                <li>✓ Step-by-step fix instructions</li>
                <li>✓ Legal compliance guide</li>
                <li>✓ Risk assessment</li>
                <li>✓ Priority email support</li>
              </ul>
              <button className="block w-full text-center bg-white text-purple-900 hover:bg-slate-100 py-3 rounded-lg font-semibold transition-colors">
                Buy Report
              </button>
            </div>

            {/* Monthly Monitoring */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-2">Monthly Monitoring</h3>
              <p className="text-3xl font-bold mb-4">$49<span className="text-lg text-slate-400">/mo</span></p>
              <p className="text-sm text-slate-500 mb-4">Subscription</p>
              <ul className="text-slate-400 text-sm space-y-2 mb-6">
                <li>✓ Everything in Report</li>
                <li>✓ Automatic monthly rescans</li>
                <li>✓ Alert on new issues</li>
                <li>✓ Compliance tracking</li>
                <li>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <summary className="font-semibold cursor-pointer">What's included in the detailed report?</summary>
              <p className="text-slate-400 mt-2 text-sm">
                A comprehensive 5-page PDF covering all compliance issues found, step-by-step fix instructions, 
                legal context for each issue, and a prioritized action plan.
              </p>
            </details>
            <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <summary className="font-semibold cursor-pointer">Do you offer refunds?</summary>
              <p className="text-slate-400 mt-2 text-sm">
                Yes! If you're not satisfied with your report, contact us within 7 days for a full refund.
              </p>
            </details>
            <details className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <summary className="font-semibold cursor-pointer">Can I scan multiple websites?</summary>
              <p className="text-slate-400 mt-2 text-sm">
                Free scans are unlimited. Each detailed report purchase covers one website. 
                Monthly monitoring can track up to 5 websites per account.
              </p>
            </details>
          </div>
        </div>
      </main>
    </>
  );
}
