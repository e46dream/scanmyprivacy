'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';

const ecommerceFeatures = [
  {
    title: 'GDPR Compliance for E-commerce',
    description: 'Ensure your online store meets EU data protection requirements for customer data.',
    icon: '🇪🇺',
  },
  {
    title: 'PCI DSS Requirements',
    description: 'Payment Card Industry Data Security Standard compliance for handling credit cards.',
    icon: '💳',
  },
  {
    title: 'Cookie Consent Management',
    description: 'Implement proper consent for marketing, analytics, and essential cookies.',
    icon: '🍪',
  },
  {
    title: 'Customer Data Protection',
    description: 'Secure storage and processing of customer personal information.',
    icon: '🛡️',
  },
  {
    title: 'Third-Party Integration Audit',
    description: 'Check privacy practices of payment processors, analytics, and marketing tools.',
    icon: '🔌',
  },
  {
    title: 'Data Breach Response Plan',
    description: 'Prepare incident response procedures for potential security breaches.',
    icon: '🚨',
  },
];

const platforms = [
  { name: 'Shopify', icon: '🛒', description: 'Full compliance scanning for Shopify stores' },
  { name: 'WooCommerce', icon: '📦', description: 'WordPress e-commerce compliance checks' },
  { name: 'Magento', icon: '🎨', description: 'Adobe Commerce compliance auditing' },
  { name: 'BigCommerce', icon: '🏪', description: 'BigCommerce store privacy scanning' },
  { name: 'Squarespace', icon: '⬜', description: 'Squarespace commerce compliance' },
  { name: 'Wix', icon: '✨', description: 'Wix store privacy and security checks' },
];

export default function EcommercePage() {
  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/website" className="text-slate-400 hover:text-white text-sm">
            ← Back to Website Scanner
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            E-Commerce Compliance Scanner
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Specialized compliance scanning for online stores. Ensure your e-commerce business 
            meets GDPR, CCPA, and PCI DSS requirements.
          </p>
        </div>

        {/* E-commerce Specific Features */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-purple-400">E-Commerce Specific Checks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecommerceFeatures.map((feature, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Support */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-blue-400">Supported E-Commerce Platforms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                <span className="text-3xl mb-2 block">{platform.icon}</span>
                <h4 className="font-medium text-sm">{platform.name}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Why E-commerce Needs This */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-red-400">⚠️ E-Commerce Compliance Risks</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Customer payment data exposure (PCI DSS fines up to $100K/month)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>GDPR fines up to €20M or 4% of annual revenue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>CCPA penalties up to $7,500 per violation per customer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Reputational damage and customer trust loss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Payment processor account suspension</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-900/20 border border-green-700 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-green-400">✅ Benefits of Compliance</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Avoid costly regulatory fines and penalties</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Build customer trust and increase conversions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Expand to EU and California markets legally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Protect against data breach liability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Secure payment processing relationships</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-700 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">E-Commerce Compliance Report</h3>
              <p className="text-slate-400 mb-4">
                Comprehensive audit including PCI DSS readiness, GDPR compliance, 
                cookie analysis, and platform-specific recommendations.
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>✓ 10+ page detailed PDF report</li>
                <li>✓ Platform-specific guidance</li>
                <li>✓ Payment processor compliance check</li>
                <li>✓ Customer data flow analysis</li>
                <li>✓ 30-day action plan</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$99</div>
              <p className="text-slate-400 text-sm mb-4">One-time payment</p>
              <Link
                href="/website"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Scan Your Store →
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-300 text-sm mb-4">
              "Found issues with our Shopify cookie consent we didn't know existed. 
              Fixed them before our EU launch."
            </p>
            <div className="text-slate-400 text-sm">— Sarah K., Fashion Retailer</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-300 text-sm mb-4">
              "The PCI DSS checklist alone was worth the price. Helped us prepare 
              for our security audit."
            </p>
            <div className="text-slate-400 text-sm">— Mike T., Electronics Store</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-300 text-sm mb-4">
              "Saved us from potential GDPR fines. The report was detailed and 
              actionable. Highly recommend!"
            </p>
            <div className="text-slate-400 text-sm">— Emma R., Beauty Brand</div>
          </div>
        </div>
      </main>
    </>
  );
}
