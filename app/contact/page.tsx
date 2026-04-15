'use client';

import Navigation from '@/components/Navigation';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Have questions about privacy compliance or need help with your scan? 
            We&apos;re here to help.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Email</h3>
                <p className="text-gray-600">support@scanmyprivacy.com</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Business Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM UTC</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Support</h3>
            <p className="text-blue-800">
              For technical issues or questions about your scan results, 
              please include your scan URL and any error messages in your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
