'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-400 mb-6">
            Last Updated: April 6, 2026<br />
            Effective Date: April 6, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-400 mb-4">
              ScanMyPrivacy (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services.
            </p>
            <p className="text-slate-400">
              By using ScanMyPrivacy, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">2.1 Personal Privacy Scanner</h3>
            <p className="text-slate-400 mb-4">
              Our Personal Privacy Scanner operates entirely within your browser. We do not collect or store any personal information on our servers:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Your IP address is fetched temporarily but not logged or stored</li>
              <li>Browser fingerprint data is analyzed locally in your browser</li>
              <li>Scan results are stored in your browser&apos;s localStorage only</li>
              <li>No personally identifiable information is transmitted to our servers</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">2.2 Website Compliance Scanner</h3>
            <p className="text-slate-400 mb-4">
              For website compliance scanning, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Email address (for report delivery)</li>
              <li>Website URL (to perform the scan)</li>
              <li>Payment information (processed securely by Stripe - we never store card details)</li>
              <li>Scan results and generated reports</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">2.3 Automatically Collected Information</h3>
            <p className="text-slate-400">
              We may collect standard server logs including IP address, browser type, pages visited, and timestamps. 
              These logs are used solely for security and performance monitoring and are retained for 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">3. Data Retention</h2>
            
            <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
              <h3 className="text-lg font-medium text-blue-400 mb-4">Summary of Data Retention Periods</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <div>
                    <p className="font-medium text-white">Personal Scanner Results</p>
                    <p className="text-sm text-slate-500">Stored in browser localStorage</p>
                  </div>
                  <span className="text-green-400 font-medium">24 hours</span>
                </div>
                
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <div>
                    <p className="font-medium text-white">Website Scan Reports</p>
                    <p className="text-sm text-slate-500">Stored on our secure servers</p>
                  </div>
                  <span className="text-green-400 font-medium">30 days</span>
                </div>
                
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <div>
                    <p className="font-medium text-white">Server Logs</p>
                    <p className="text-sm text-slate-500">For security & debugging</p>
                  </div>
                  <span className="text-green-400 font-medium">30 days</span>
                </div>
                
                <div className="flex justify-between items-start py-3 border-b border-slate-700">
                  <div>
                    <p className="font-medium text-white">Email Addresses</p>
                    <p className="text-sm text-slate-500">While account active</p>
                  </div>
                  <span className="text-yellow-400 font-medium">Until deleted</span>
                </div>
                
                <div className="flex justify-between items-start py-3">
                  <div>
                    <p className="font-medium text-white">Payment Information</p>
                    <p className="text-sm text-slate-500">Processed by Stripe - we never store card data</p>
                  </div>
                  <span className="text-red-400 font-medium">Never stored</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">3.1 Personal Scanner Data</h3>
            <p className="text-slate-400 mb-4">
              Personal privacy scan results are stored only in your browser&apos;s localStorage. This data:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Automatically expires after 24 hours (timestamp-based cleanup)</li>
              <li>Is never transmitted to our servers</li>
              <li>Can be manually cleared through your browser settings</li>
              <li>Remains entirely on your device</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">3.2 Website Scanner Data</h3>
            <p className="text-slate-400 mb-4">
              Website compliance scan reports and associated data are retained for 30 days. This allows you to:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2 mb-4">
              <li>Access your scan history</li>
              <li>Download reports multiple times</li>
              <li>Track compliance improvements over time</li>
            </ul>
            <p className="text-slate-400">
              After 30 days, scan reports are automatically and permanently deleted from our servers.
            </p>

            <h3 className="text-lg font-medium text-slate-300 mt-4 mb-2">3.3 Account Deletion</h3>
            <p className="text-slate-400">
              When you delete your account, all associated data including email address, scan history, and reports 
              are permanently removed from our servers within 48 hours. Some anonymized analytics data may be retained 
              for statistical purposes but cannot be linked to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To deliver scan reports to your email</li>
              <li>To process payments securely</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To improve our services based on usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
            <p className="text-slate-400 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>All data transmission uses TLS/SSL encryption</li>
              <li>Payment processing is handled by PCI-compliant Stripe</li>
              <li>Access to servers is restricted and monitored</li>
              <li>Regular security audits and updates</li>
              <li>We never sell or share your personal data with third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-400 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="text-slate-400 mt-4">
              To exercise these rights, contact us at privacy@scanmyprivacy.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
            <p className="text-slate-400">
              We use essential cookies only for the functioning of our service. 
              We do not use tracking or advertising cookies. 
              For the Personal Privacy Scanner, we use localStorage (not cookies) to temporarily store scan results on your device.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
            <p className="text-slate-400">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the &ldquo;Last Updated&rdquo; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p className="text-slate-400">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 text-slate-400">
              <p>Email: privacy@scanmyprivacy.com</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-700">
            <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
