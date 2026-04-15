'use client';

import Navigation from '@/components/Navigation';

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">GDPR Compliance</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="mb-6">
            At ScanMyPrivacy, we take data protection seriously. This page explains how we 
            comply with the General Data Protection Regulation (GDPR).
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights Under GDPR</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> You can correct inaccurate data</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of your data</li>
            <li><strong>Right to Object:</strong> You can object to certain processing</li>
            <li><strong>Right to Portability:</strong> You can receive your data in a machine-readable format</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What Data We Collect</h2>
          <p className="mb-4">
            We collect minimal data necessary to provide our service:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Email address (for sending scan results)</li>
            <li>Website URLs you choose to scan</li>
            <li>Payment information (processed by Stripe/PayPal, not stored by us)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Data</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>To deliver scan results and reports</li>
            <li>To process payments</li>
            <li>To improve our scanning service</li>
            <li>To communicate about your account</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain your data only as long as necessary:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Scan results: 30 days</li>
            <li>Payment records: 7 years (legal requirement)</li>
            <li>Account information: Until you delete your account</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Our DPO</h2>
          <p>
            For GDPR-related inquiries, contact our Data Protection Officer at 
            privacy@scanmyprivacy.com
          </p>
        </div>
      </div>
    </div>
  );
}
