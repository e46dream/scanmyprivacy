'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

// API endpoint - change to your Railway URL in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WebsitePage() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'upi'>('stripe');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const scanWebsite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;
    
    // Basic URL validation - proper but not too strict
    const trimmedUrl = url.trim();
    
    console.log('Debug - URL entered:', trimmedUrl);
    
    // Basic checks
    if (!trimmedUrl || trimmedUrl.length < 3) {
      console.log('Debug - URL too short or empty');
      setResults({
        url,
        error: 'Please enter a website URL',
        demo: false
      });
      return;
    }
    
    // Check if it's a reasonable format
    const hasDot = trimmedUrl.includes('.');
    const startsWithHttp = trimmedUrl.startsWith('http');
    
    console.log('Debug - hasDot:', hasDot, 'startsWithHttp:', startsWithHttp);
    
    // If it starts with http, accept it
    // If it doesn't start with http, it should have a dot
    if (!startsWithHttp && !hasDot) {
      console.log('Debug - URL validation failed');
      setResults({
        url,
        error: 'Please enter a valid website URL (e.g., example.com or https://website.com)',
        demo: false
      });
      return;
    }
    
    console.log('Debug - URL validation passed');
    
    setScanning(true);
    setResults(null); // Clear previous results
    
    try {
      // Normalize URL
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }

      // Call the scanner API
      const response = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      }).catch(() => null);
      
      if (!response || !response.ok) {
        // API not available - use demo mode
        throw new Error('API not available');
      }
      
      const data = await response.json();
      
      // Check if API returned an error
      if (!data.success || !data.data) {
        throw new Error(data.error || data.message || 'Invalid API response');
      }
      
      // Transform scanner results to match UI format
      const transformedResults = {
        url: data.data.meta.url,
        score: data.data.scoring.score,
        grade: data.data.scoring.grade,
        status: data.data.scoring.status,
        issues: [
          ...data.data.criticalIssues.map((issue: any) => ({
            severity: 'critical',
            title: issue.name,
            description: issue.detail,
            fix: issue.fix,
            gdprArticle: issue.gdprArticle
          })),
          ...data.data.warnings.map((issue: any) => ({
            severity: 'high',
            title: issue.name,
            description: issue.detail,
            fix: issue.fix,
            gdprArticle: issue.gdprArticle
          }))
        ],
        checks: data.data.checks,
        cookies: data.data.cookieTable,
        trackers: data.data.trackerList,
        rawData: data.data
      };
      
      setResults(transformedResults);
    } catch (err: any) {
      console.error('Scan error:', err);
      // Show specific error messages based on error type
      let errorMessage = 'Scan failed. Please check the URL and try again.';
      
      if (err.message?.includes('ENOTFOUND') || err.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Website not found or unreachable. Please check the URL and try again.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Scan timed out. The website may be slow to load. Please try again.';
      } else if (err.message?.includes('404')) {
        errorMessage = 'Page not found (404 error). Please check the URL.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Server error. Please try again in a few minutes.';
      } else if (err.message?.includes('SSL') || err.message?.includes('certificate')) {
        errorMessage = 'SSL certificate error. The website may have security issues.';
      } else if (err.message?.includes('Execution context was destroyed')) {
        errorMessage = 'Website failed to load properly. This may be due to JavaScript errors or blocking.';
      } else if (err.message?.includes('Access denied') || err.message?.includes('403')) {
        errorMessage = 'Access denied. The website is blocking automated scans. Some sites protect against automated access.';
      }
      
      setResults({
        url,
        error: errorMessage,
        demo: false
      });
    }
    
    setScanning(false);
  };

  const handlePurchase = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (!results) return;
    
    setCheckoutLoading(true);
    
    try {
      if (paymentMethod === 'stripe') {
        // Stripe checkout
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
      } else if (paymentMethod === 'paypal') {
        // PayPal checkout
        const response = await fetch(`${API_URL}/create-paypal-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: results.url,
            userEmail: email,
          }),
        });
        
        const { orderId } = await response.json();
        
        if (orderId) {
          // Redirect to PayPal approval
          window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
        } else {
          throw new Error('No PayPal order ID returned');
        }
      } else if (paymentMethod === 'upi') {
        // UPI / Razorpay checkout
        const response = await fetch(`${API_URL}/create-upi-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: results.url,
            userEmail: email,
          }),
        });
        
        const { orderId, keyId, amount } = await response.json();
        
        if (orderId && keyId) {
          // Load Razorpay checkout
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const options = {
              key: keyId,
              amount: amount,
              currency: 'INR',
              name: 'PrivacyScan',
              description: `Compliance Report for ${results.url}`,
              order_id: orderId,
              handler: function (response: any) {
                // Payment successful
                window.location.href = '/payment/success';
              },
              prefill: {
                email: email,
              },
              theme: {
                color: '#7c3aed',
              },
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          };
          document.body.appendChild(script);
        } else {
          throw new Error('No UPI order details returned');
        }
      }
    } catch (err: any) {
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
          <form onSubmit={scanWebsite} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://website.com"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={scanning || !url}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              {scanning ? 'Scanning...' : 'Scan Now'}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-2">Free scan • No signup required • Takes 60 seconds</p>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Error State */}
            {results.error ? (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-red-400 text-2xl">❌</span>
                  <h3 className="text-lg font-semibold text-red-400">Scan Failed</h3>
                </div>
                <p className="text-red-300 mb-2">{results.error}</p>
                <p className="text-sm text-slate-400 mb-4">Please enter a valid website URL (e.g., google.com, https://example.com)</p>
                <button
                  onClick={() => setResults(null)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
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
              
              {/* Payment method selection */}
              <div className="mt-6 space-y-4">
                <div className="max-w-md">
                  <label className="block text-sm font-medium mb-2">Email for report delivery</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 ${
                      emailError ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-400 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    💳 Card
                    <span className="block text-xs font-normal mt-1">$49 USD</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-600 text-white border-2 border-blue-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    🅿️ PayPal
                    <span className="block text-xs font-normal mt-1">$49 USD</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      paymentMethod === 'upi'
                        ? 'bg-green-600 text-white border-2 border-green-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    🇮🇳 UPI
                    <span className="block text-xs font-normal mt-1">₹3900 INR</span>
                  </button>
                </div>

                <button 
                  onClick={handlePurchase}
                  disabled={checkoutLoading || !email || !validateEmail(email) || !results}
                  className="bg-white text-purple-900 hover:bg-slate-100 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {checkoutLoading 
                    ? 'Redirecting to checkout...' 
                    : paymentMethod === 'upi' 
                      ? 'Pay ₹39.00 via UPI'
                      : 'Buy Detailed Report - $49'}
                </button>
                <p className="text-xs text-slate-400">
                  Secure payment via {paymentMethod === 'stripe' ? 'Stripe' : paymentMethod === 'paypal' ? 'PayPal' : 'Razorpay'}. 
                  Report delivered within 2 minutes.
                </p>
              </div>
            </div>
              </>
            )}
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
