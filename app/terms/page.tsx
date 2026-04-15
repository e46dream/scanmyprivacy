'use client';

import Navigation from '@/components/Navigation';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="mb-4">Last updated: April 15, 2026</p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using ScanMyPrivacy, you accept and agree to be bound by these 
            Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            ScanMyPrivacy provides automated privacy compliance scanning for websites. 
            Our scans check for HTTPS, cookie consent, privacy policies, trackers, and form security.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Free and Paid Services</h2>
          <p className="mb-4">
            We offer both free basic scans and paid detailed reports. Free scans provide 
            summary information. Paid reports include detailed analysis and PDF documentation.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Limitations</h2>
          <p className="mb-4">
            Our scans are automated and provide general guidance only. They do not constitute 
            legal advice. Always consult with a qualified legal professional for compliance matters.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Refund Policy</h2>
          <p className="mb-4">
            Due to the digital nature of our reports, all sales are final. Refunds may be 
            considered on a case-by-case basis if the scan failed to complete.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Contact</h2>
          <p>
            For questions about these terms, contact us at support@scanmyprivacy.com
          </p>
        </div>
      </div>
    </div>
  );
}
