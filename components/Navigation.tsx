'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <>
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🔒</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ScanMyPrivacy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Personal Scan
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-700">
                  <Link href="/personal" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-t-lg">
                    Privacy Dashboard
                  </Link>
                  <Link href="/personal/ip-leak" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    IP Leak Test
                  </Link>
                  <Link href="/personal/fingerprint" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    Browser Fingerprint
                  </Link>
                  <Link href="/personal/dns-leak" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-b-lg">
                    DNS Leak Check
                  </Link>
                </div>
              </div>

              <div className="relative group">
                <button className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Website Compliance
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-700">
                  <Link href="/website" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-t-lg">
                    Website Scanner
                  </Link>
                  <Link href="/pricing" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                    Pricing & Plans
                  </Link>
                  <Link href="/website/ecommerce" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-b-lg">
                    For E-Commerce
                  </Link>
                </div>
              </div>

              <Link href="/blog" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Blog
              </Link>
              <Link href="/tools" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Tools
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center">
              <Link 
                href="/website" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Scan Website
              </Link>
            </div>

            {/* Mobile menu button with hover dropdown */}
            <div className="md:hidden flex items-center relative group">
              <button
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Floating Menu Items on Hover */}
              <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link 
                  href="/personal" 
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors mb-0.5"
                >
                  <span>👤</span>
                  <span>Personal</span>
                </Link>
                <Link 
                  href="/website" 
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors mb-0.5"
                >
                  <span>🌐</span>
                  <span>Website</span>
                </Link>
                <Link 
                  href="/pricing" 
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors mb-0.5"
                >
                  <span>💰</span>
                  <span>Pricing</span>
                </Link>
                <Link 
                  href="/blog" 
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors mb-0.5"
                >
                  <span>📝</span>
                  <span>Blog</span>
                </Link>
                <div className="mt-1 space-y-0.5">
                  <Link 
                    href="/personal"
                    className="flex items-center justify-center space-x-1 w-24 bg-blue-600/90 hover:bg-blue-700 text-white py-1 px-2 rounded font-medium transition-colors text-xs backdrop-blur-sm"
                  >
                    <span>👤</span>
                    <span>Scan</span>
                  </Link>
                  <Link 
                    href="/website"
                    className="flex items-center justify-center space-x-1 w-24 bg-purple-600/90 hover:bg-purple-700 text-white py-1 px-2 rounded font-medium transition-colors text-xs backdrop-blur-sm"
                  >
                    <span>🌐</span>
                    <span>Audit</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
