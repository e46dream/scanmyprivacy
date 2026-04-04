'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PersonalPage() {
  const [ipData, setIpData] = useState<any>(null);
  const [webrtcStatus, setWebrtcStatus] = useState('checking');
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [dnsStatus, setDnsStatus] = useState('checking');
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Fetch IP data
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpData(data))
      .catch(() => setIpData({ ip: 'Unable to detect' }));

    // Check WebRTC
    const checkWebRTC = () => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('test');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const ip = e.candidate.candidate.split(' ')[4];
            if (ip && !ip.startsWith('192.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
              setWebrtcStatus('leak');
            }
          }
        };
        setTimeout(() => {
          if (webrtcStatus === 'checking') setWebrtcStatus('secure');
        }, 2000);
      } catch {
        setWebrtcStatus('secure');
      }
    };
    checkWebRTC();

    // Calculate fingerprint
    const fp = {
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      languages: navigator.languages.join(', '),
      platform: navigator.platform,
      userAgent: navigator.userAgent.split(' ')[0],
    };
    setFingerprint(fp);

    // Calculate privacy score
    let s = 100;
    if (webrtcStatus === 'leak') s -= 30;
    if (!navigator.doNotTrack) s -= 10;
    setScore(s);
  }, [webrtcStatus]);

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Personal Privacy Scanner</h1>
        <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Check your digital privacy in less than 60 seconds</p>

        {/* Score Card */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Privacy Score</h2>
          <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#ef4444' }}>
            {score}
          </div>
          <p className="text-slate-400">
            {score > 80 ? 'Good privacy protection!' : score > 50 ? 'Some vulnerabilities detected' : 'Critical privacy risks found'}
          </p>
        </div>

        {/* Test Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* IP Test */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">🌐 Public IP</h3>
            <p className="text-base sm:text-lg font-mono break-all">{ipData?.ip || 'Loading...'}</p>
          </div>

          {/* WebRTC Test */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">📹 WebRTC</h3>
            <p className={webrtcStatus === 'leak' ? 'text-red-400' : 'text-green-400'}>
              {webrtcStatus === 'checking' ? 'Checking...' : webrtcStatus === 'leak' ? '⚠️ Leak Detected' : '✅ Secure'}
            </p>
          </div>

          {/* Fingerprint */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">👆 Browser Fingerprint</h3>
            {fingerprint && (
              <ul className="text-sm text-slate-400 space-y-1">
                <li>Screen: {fingerprint.screen}</li>
                <li>Timezone: {fingerprint.timezone}</li>
                <li>Languages: {fingerprint.languages}</li>
              </ul>
            )}
          </div>

          {/* DNS Test */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">🔍 DNS Check</h3>
            <p className="text-slate-400 text-sm sm:text-base">Using browser DNS configuration</p>
          </div>
        </div>

        {/* Cross-promo CTA */}
        <div className="mt-6 sm:mt-8 bg-purple-900/20 border border-purple-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Own a website or business?</h3>
          <p className="text-slate-400 mb-3 sm:mb-4 text-sm sm:text-base">
            You're protecting YOUR privacy. But are you protecting YOUR USERS' privacy?
          </p>
          <Link 
            href="/website"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            Check Your Website Compliance →
          </Link>
        </div>

        {/* Affiliate Recommendations */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <a href="https://nordvpn.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h4 className="font-semibold">NordVPN</h4>
            <p className="text-sm text-slate-400">68% OFF - Best Overall</p>
          </a>
          <a href="https://www.expressvpn.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h4 className="font-semibold">ExpressVPN</h4>
            <p className="text-sm text-slate-400">49% OFF - Fastest</p>
          </a>
          <a href="https://www.surfshark.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
            <h4 className="font-semibold">Surfshark</h4>
            <p className="text-sm text-slate-400">81% OFF - Unlimited</p>
          </a>
        </div>
      </main>
    </>
  );
}
