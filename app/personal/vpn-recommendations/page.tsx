'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const allVPNs = [
  {
    name: 'NordVPN',
    icon: '🛡️',
    color: 'blue',
    discount: '68% OFF',
    tagline: 'Best Overall',
    url: 'https://nordvpn.com/',
    features: ['6,000+ servers', 'Double VPN', 'No logs audit'],
  },
  {
    name: 'ExpressVPN',
    icon: '⚡',
    color: 'purple',
    discount: '49% OFF',
    tagline: 'Fastest Speed',
    url: 'https://www.expressvpn.com/',
    features: ['3,000+ servers', 'Lightway protocol', 'RAM-only servers'],
  },
  {
    name: 'Surfshark',
    icon: '🔒',
    color: 'teal',
    discount: '81% OFF',
    tagline: 'Unlimited Devices',
    url: 'https://www.surfshark.com/',
    features: ['3,200+ servers', 'CleanWeb ad blocker', 'MultiHop'],
  },
  {
    name: 'ProtonVPN',
    icon: '🔐',
    color: 'indigo',
    discount: '50% OFF',
    tagline: 'Privacy Focused',
    url: 'https://protonvpn.com/',
    features: ['Swiss based', 'Secure Core', 'Open source'],
  },
  {
    name: 'CyberGhost',
    icon: '👻',
    color: 'yellow',
    discount: '83% OFF',
    tagline: 'Easy to Use',
    url: 'https://www.cyberghostvpn.com/',
    features: ['9,000+ servers', '45-day guarantee', 'Streaming optimized'],
  },
  {
    name: 'PIA',
    icon: '🔓',
    color: 'green',
    discount: '82% OFF',
    tagline: 'Customizable',
    url: 'https://www.privateinternetaccess.com/',
    features: ['35,000+ servers', 'Open source', 'Custom encryption'],
  },
  {
    name: 'Mullvad',
    icon: '🧅',
    color: 'orange',
    discount: 'Flat €5/mo',
    tagline: 'Anonymous',
    url: 'https://mullvad.net/',
    features: ['No email needed', 'Cash payments', 'Bridge mode'],
  },
  {
    name: 'Windscribe',
    icon: '💨',
    color: 'cyan',
    discount: 'Free + Pro',
    tagline: 'Generous Free',
    url: 'https://windscribe.com/',
    features: ['10GB free', 'R.O.B.E.R.T. blocker', 'Split tunneling'],
  },
  {
    name: 'Hotspot Shield',
    icon: '🛡️',
    color: 'red',
    discount: '67% OFF',
    tagline: 'Catapult Hydra',
    url: 'https://www.hotspotshield.com/',
    features: ['3,200+ servers', 'Proprietary protocol', 'Malware protection'],
  },
  {
    name: 'IPVanish',
    icon: '🌐',
    color: 'emerald',
    discount: '72% OFF',
    tagline: 'US Based',
    url: 'https://www.ipvanish.com/',
    features: ['2,200+ servers', 'Unlimited connections', 'SOCKS5 proxy'],
  },
  {
    name: 'Atlas VPN',
    icon: '🗺️',
    color: 'amber',
    discount: '85% OFF',
    tagline: 'Budget Pick',
    url: 'https://atlasvpn.com/',
    features: ['750+ servers', 'SafeSwap', 'Data breach monitor'],
  },
  {
    name: 'TorGuard',
    icon: '🧅',
    color: 'violet',
    discount: '50% OFF',
    tagline: 'Torrenting',
    url: 'https://torguard.net/',
    features: ['3,000+ servers', 'Stealth proxy', 'Dedicated IPs'],
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { border: string; text: string; bg: string }> = {
    blue: { border: 'border-blue-700/50 hover:border-blue-500', text: 'text-blue-400', bg: 'from-blue-900/30' },
    purple: { border: 'border-purple-700/50 hover:border-purple-500', text: 'text-purple-400', bg: 'from-purple-900/30' },
    teal: { border: 'border-teal-700/50 hover:border-teal-500', text: 'text-teal-400', bg: 'from-teal-900/30' },
    indigo: { border: 'border-indigo-700/50 hover:border-indigo-500', text: 'text-indigo-400', bg: 'from-indigo-900/30' },
    yellow: { border: 'border-yellow-700/50 hover:border-yellow-500', text: 'text-yellow-400', bg: 'from-yellow-900/30' },
    green: { border: 'border-green-700/50 hover:border-green-500', text: 'text-green-400', bg: 'from-green-900/30' },
    orange: { border: 'border-orange-700/50 hover:border-orange-500', text: 'text-orange-400', bg: 'from-orange-900/30' },
    cyan: { border: 'border-cyan-700/50 hover:border-cyan-500', text: 'text-cyan-400', bg: 'from-cyan-900/30' },
    red: { border: 'border-red-700/50 hover:border-red-500', text: 'text-red-400', bg: 'from-red-900/30' },
    emerald: { border: 'border-emerald-700/50 hover:border-emerald-500', text: 'text-emerald-400', bg: 'from-emerald-900/30' },
    amber: { border: 'border-amber-700/50 hover:border-amber-500', text: 'text-amber-400', bg: 'from-amber-900/30' },
    violet: { border: 'border-violet-700/50 hover:border-violet-500', text: 'text-violet-400', bg: 'from-violet-900/30' },
  };
  return colors[color] || colors.blue;
};

export default function VPNRecommendationsPage() {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // First try to get score from URL query parameter
    const urlScore = searchParams.get('score');
    
    // Then try localStorage
    const storedScore = localStorage.getItem('privacyScore');
    const storedTimestamp = localStorage.getItem('privacyScoreTimestamp');
    const isRecent = storedTimestamp && (Date.now() - parseInt(storedTimestamp)) < 300000; // 5 minutes
    
    let finalScore = 0;
    let scoreSource = '';
    
    if (urlScore) {
      finalScore = parseInt(urlScore);
      scoreSource = 'URL param';
    } else if (storedScore && isRecent) {
      finalScore = parseInt(storedScore);
      scoreSource = 'localStorage';
    } else {
      // Recalculate if no stored score
      let s = 100;
      
      // Check WebRTC
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('test');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const ip = e.candidate.candidate.split(' ')[4];
            if (ip && !ip.startsWith('192.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
              s -= 30;
            }
          }
        };
      } catch {
        // WebRTC secure
      }
      
      if (!navigator.doNotTrack) s -= 10;
      
      finalScore = s;
      scoreSource = 'calculated';
      
      // Store for future use
      localStorage.setItem('privacyScore', s.toString());
      localStorage.setItem('privacyScoreTimestamp', Date.now().toString());
    }
    
    setScore(finalScore);
    setLoading(false);
    
    console.log(`Privacy Score: ${finalScore} (source: ${scoreSource})`);
  }, [searchParams]);

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/personal" className="text-slate-400 hover:text-white text-sm">
            ← Back to Privacy Scanner
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">VPN Recommendations</h1>
          <p className="text-slate-400">Compare 12+ trusted VPN providers to protect your privacy</p>
        </div>

        {/* Score Display */}
        <div className="bg-slate-800 rounded-xl p-6 sm:p-8 mb-8 border border-slate-700 max-w-md mx-auto text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Privacy Score</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div 
                className="text-5xl sm:text-6xl font-bold mb-3" 
                style={{ color: score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#ef4444' }}
              >
                {score}
              </div>
              <p className="text-slate-400 mb-4">
                {score > 80 ? 'Good privacy protection!' : score > 50 ? 'Some vulnerabilities detected' : 'Critical privacy risks found'}
              </p>
              
              {/* VPN Recommendation */}
              <div className={`p-3 rounded-lg text-sm ${score < 80 ? 'bg-red-900/20 border border-red-700/50' : 'bg-green-900/20 border border-green-700/50'}`}>
                {score < 80 ? (
                  <div>
                    <p className="text-red-400 font-medium mb-1">⚠️ Your privacy needs protection!</p>
                    <p className="text-slate-400 text-xs">
                      Your IP is exposed. A VPN encrypts traffic and hides your real IP from trackers.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-green-400 font-medium mb-1">✅ Good protection!</p>
                    <p className="text-slate-400 text-xs">
                      Keep your VPN active to maintain protection, especially on public WiFi.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* VPN Grid - Score in Center */}
        <div className="relative">
          {/* VPN Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {allVPNs.map((vpn, index) => {
              const colors = getColorClasses(vpn.color);
              // Skip the center position (index 4 for 3x3 grid or appropriate position)
              return (
                <a
                  key={vpn.name}
                  href={vpn.url}
                  target="_blank"
                  rel="noopener"
                  className={`bg-gradient-to-br ${colors.bg} to-slate-800 p-4 rounded-xl border ${colors.border} transition-all hover:scale-105 flex flex-col items-center text-center`}
                >
                  <span className="text-3xl mb-2">{vpn.icon}</span>
                  <h3 className={`font-semibold ${colors.text}`}>{vpn.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{vpn.discount}</p>
                  <p className="text-xs text-slate-500">{vpn.tagline}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700/50 w-full">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {vpn.features[0]}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-10 bg-slate-800 rounded-xl p-6 border border-slate-700 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Quick Comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400">VPN</th>
                <th className="text-center py-2 text-slate-400">Servers</th>
                <th className="text-center py-2 text-slate-400">Devices</th>
                <th className="text-center py-2 text-slate-400">Best For</th>
                <th className="text-right py-2 text-slate-400">Deal</th>
              </tr>
            </thead>
            <tbody>
              {allVPNs.slice(0, 6).map((vpn) => (
                <tr key={vpn.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 flex items-center gap-2">
                    <span>{vpn.icon}</span>
                    <span className="font-medium">{vpn.name}</span>
                  </td>
                  <td className="text-center py-3 text-slate-400">{vpn.features[0]}</td>
                  <td className="text-center py-3 text-slate-400">
                    {vpn.name === 'Surfshark' ? 'Unlimited' : '5-10'}
                  </td>
                  <td className="text-center py-3 text-slate-400">{vpn.tagline}</td>
                  <td className="text-right py-3">
                    <span className="text-green-400 text-xs">{vpn.discount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why Use a VPN */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="font-semibold mb-3 text-blue-400">🔒 Why Use a VPN?</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Hide your real IP address from websites</li>
              <li>• Encrypt traffic on public WiFi</li>
              <li>• Bypass geo-restrictions</li>
              <li>• Prevent ISP tracking</li>
              <li>• Secure torrenting</li>
            </ul>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="font-semibold mb-3 text-purple-400">🎯 How to Choose</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Look for audited no-logs policies</li>
              <li>• Check server locations you need</li>
              <li>• Consider connection speed</li>
              <li>• Verify kill switch feature</li>
              <li>• Check device limit</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50 text-center">
          <h3 className="text-xl font-semibold mb-2">Protect Your Privacy Today</h3>
          <p className="text-slate-400 mb-4 max-w-2xl mx-auto">
            Based on your privacy score of {score}, we recommend using a VPN to secure your connection 
            and prevent tracking by ISPs, advertisers, and malicious actors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://nordvpn.com/"
              target="_blank"
              rel="noopener"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get NordVPN (68% OFF) →
            </a>
            <a 
              href="https://www.expressvpn.com/"
              target="_blank"
              rel="noopener"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get ExpressVPN (49% OFF) →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
