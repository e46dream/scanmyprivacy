'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

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

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />
          
          {/* Floating Menu */}
          <div className="fixed inset-x-4 top-20 bottom-4 md:hidden z-50 pointer-events-none">
            <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto max-h-full overflow-y-auto">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="text-lg font-semibold text-white">Menu</span>
                <button
                  onClick={closeMenu}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <Link 
                  href="/personal" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span>Personal Privacy Scan</span>
                </Link>
                <Link 
                  href="/website" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <span className="text-xl">🌐</span>
                  <span>Website Compliance</span>
                </Link>
                <Link 
                  href="/pricing" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <span className="text-xl">💰</span>
                  <span>Pricing</span>
                </Link>
                <Link 
                  href="/blog" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <span className="text-xl">📝</span>
                  <span>Blog</span>
                </Link>
                <Link 
                  href="/tools" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <span className="text-xl">🛠️</span>
                  <span>Tools</span>
                </Link>
              </div>

              {/* CTA Section */}
              <div className="p-4 border-t border-slate-700 space-y-2">
                <Link 
                  href="/personal"
                  onClick={closeMenu}
                  className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span>👤</span>
                  <span>Scan Your Privacy</span>
                </Link>
                <Link 
                  href="/website"
                  onClick={closeMenu}
                  className="flex items-center justify-center space-x-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  <span>🌐</span>
                  <span>Audit Your Website</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
