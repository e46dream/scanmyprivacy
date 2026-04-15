'use client';

import Navigation from '@/components/Navigation';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="mb-4">Last updated: April 15, 2026</p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your device when you visit a website. 
            They help websites remember your preferences and improve your browsing experience.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
          <p className="mb-4">
            ScanMyPrivacy uses minimal cookies:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Preference cookies:</strong> Remember your settings and choices</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
          <p className="mb-4">
            You can control cookies through your browser settings. Most browsers allow you to 
            refuse or delete cookies. However, disabling cookies may affect the functionality 
            of our website.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
          <p className="mb-4">
            We do not use third-party advertising cookies. Any third-party cookies are limited 
            to essential service providers like payment processors and analytics.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact</h2>
          <p>
            For questions about our cookie policy, contact support@scanmyprivacy.com
          </p>
        </div>
      </div>
    </div>
  );
}
