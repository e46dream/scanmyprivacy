'use client';

import Navigation from '@/components/Navigation';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About ScanMyPrivacy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            ScanMyPrivacy helps businesses and website owners understand their privacy compliance 
            posture. Our automated scanner checks your website for GDPR, CCPA, and other privacy 
            regulation requirements.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What We Check</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>HTTPS enforcement</li>
            <li>Cookie consent banners</li>
            <li>Privacy policy presence</li>
            <li>Third-party trackers</li>
            <li>Form security</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Personal Privacy Scan</h2>
          <p className="text-gray-600 mb-4">
            In addition to website scanning, we offer free tools to check your own privacy and security:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li><strong>IP Leak Test:</strong> Check if your real IP address is exposed</li>
            <li><strong>Browser Fingerprint:</strong> See how trackable your browser is</li>
            <li><strong>DNS Leak Check:</strong> Verify your DNS requests are secure</li>
            <li><strong>WebRTC Test:</strong> Detect potential IP leaks through WebRTC</li>
          </ul>
          <p className="text-gray-600 mb-6">
            These tools help individuals understand their digital footprint and take steps to 
            protect their online privacy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How It Works</h2>
          <p className="text-gray-600 mb-6">
            Enter any website URL and our scanner will analyze it using a headless browser. 
            Within seconds, you&apos;ll receive a detailed privacy score and actionable recommendations 
            to improve compliance.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact</h2>
          <p className="text-gray-600">
            For questions or support, email us at support@scanmyprivacy.com
          </p>
        </div>
      </div>
    </div>
  );
}
