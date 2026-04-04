'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
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
              className="text-slate-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/personal" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              Personal Privacy Scan
            </Link>
            <Link href="/website" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              Website Compliance
            </Link>
            <Link href="/pricing" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              Pricing
            </Link>
            <Link href="/blog" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              Blog
            </Link>
            <Link href="/tools" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">
              Tools
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
