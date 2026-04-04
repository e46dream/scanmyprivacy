import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navigation />
      
      {/* Hero Section - Dual Value Prop */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Scan Your Privacy.
            </span>
            <br />
            <span className="text-white">Protect Your Data.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Your privacy matters, whether you're protecting yourself or protecting your users. 
            We help with both.
          </p>

          {/* Two-Sided Value Prop */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            {/* Personal Side */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm flex flex-col">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-bold mb-3">Protect Your Privacy</h2>
              <p className="text-slate-400 mb-6 flex-grow">
                See what trackers are following you online. Check for IP leaks, browser fingerprinting, and data breaches.
              </p>
              <Link 
                href="/personal"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Personal Scan
              </Link>
              <p className="text-xs text-slate-500 mt-3">Takes less than 60 seconds</p>
            </div>

            {/* Website Side */}
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm flex flex-col">
              <div className="text-4xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold mb-3">Protect Your Users</h2>
              <p className="text-slate-400 mb-6 flex-grow">
                Audit your website for GDPR/CCPA compliance. Avoid fines up to $20M.
              </p>
              <Link 
                href="/website"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Website Scan
              </Link>
              <p className="text-xs text-slate-500 mt-3">Free scan. Detailed Reports from $49</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-800/30 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">500K+</div>
              <div className="text-sm text-slate-400 mt-1">Privacy Scans This Month</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-slate-400 mt-1">Websites Audited</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">99.7%</div>
              <div className="text-sm text-slate-400 mt-1">Uptime • No Data Stored</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Complete Privacy Protection</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Personal Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-400">Personal Scanner</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>IP Leak Detection - Know if your VPN is working</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Browser Fingerprinting - See how trackable you are</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>DNS Leak Check - Verify your DNS requests are secure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Speed Test - Check your connection security</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block bg-green-900/30 text-green-400 px-3 py-1 rounded text-sm">100% FREE</span>
              </div>
            </div>

            {/* Website Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400">Website Compliance</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>GDPR Violation Check - Cookie consent & banners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>CCPA Compliance - "Do Not Sell" requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Cookie Consent Audit - Third-party tracker detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Privacy Policy Review - Legal compliance check</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block bg-purple-900/30 text-purple-400 px-3 py-1 rounded text-sm">FREE SCAN / PAID REPORTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Latest Privacy Insights</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold mb-2">Why Google Analytics Violates GDPR</h3>
              <p className="text-sm text-slate-400">Learn about the common compliance mistakes website owners make.</p>
              <Link href="/blog/google-analytics-gdpr" className="text-blue-400 text-sm mt-3 inline-block">Read more →</Link>
            </article>
            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold mb-2">Top 10 Privacy Mistakes</h3>
              <p className="text-sm text-slate-400">The most common ways businesses accidentally violate user privacy.</p>
              <Link href="/blog/privacy-mistakes" className="text-blue-400 text-sm mt-3 inline-block">Read more →</Link>
            </article>
            <article className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold mb-2">GDPR vs CCPA vs LGPD</h3>
              <p className="text-sm text-slate-400">Which privacy regulations apply to your business?</p>
              <Link href="/blog/gdpr-ccpa-lgpd" className="text-blue-400 text-sm mt-3 inline-block">Read more →</Link>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Your data is valuable.</h2>
          <p className="text-xl text-slate-400 mb-8">Don't let companies steal it. Take control today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/personal"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Scan Your Privacy
            </Link>
            <Link 
              href="/website"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Audit Your Website
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl">🔒</span>
              <span className="font-bold">ScanMyPrivacy</span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-white">About</Link>
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/blog" className="hover:text-white">Blog</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            © 2026 ScanMyPrivacy. Privacy-first design. No tracking. No data sales.
          </p>
        </div>
      </footer>
    </>
  );
}
