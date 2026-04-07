'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Vulnerability {
  id: string;
  name: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  impact: string;
}

interface ScoreFactor {
  name: string;
  value: number;
  maxPenalty: number;
}

export default function PersonalPage() {
  const [ipData, setIpData] = useState<any>(null);
  const [webrtcStatus, setWebrtcStatus] = useState<'checking' | 'leak' | 'secure'>('checking');
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [score, setScore] = useState(100);
  const [scoreFactors, setScoreFactors] = useState<ScoreFactor[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSecure, setIsSecure] = useState(false);
  const [isDoNotTrack, setIsDoNotTrack] = useState(false);

  useEffect(() => {
    // Set browser-specific states after mount to avoid hydration mismatch
    setIsSecure(window.location.protocol === 'https:');
    setIsDoNotTrack(navigator.doNotTrack === '1');
    // Check for stored score first
    const storedScore = localStorage.getItem('privacyScore');
    const storedTimestamp = localStorage.getItem('privacyScoreTimestamp');
    const storedFactors = localStorage.getItem('privacyScoreFactors');
    const storedVulns = localStorage.getItem('privacyVulnerabilities');
    const isRecent = storedTimestamp && (Date.now() - parseInt(storedTimestamp)) < 300000;
    
    if (storedScore && isRecent && storedFactors && storedVulns) {
      setScore(parseInt(storedScore));
      setScoreFactors(JSON.parse(storedFactors));
      setVulnerabilities(JSON.parse(storedVulns));
      setLoading(false);
    }

    // Gather all browser data
    const gatherBrowserData = async () => {
      const factors: ScoreFactor[] = [];
      const vulns: Vulnerability[] = [];
      let currentScore = 100;

      // 1. WebRTC Leak Test (-25)
      let webrtcLeakDetected = false;
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('test');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        await new Promise<void>((resolve) => {
          pc.onicecandidate = (e) => {
            if (e.candidate && !webrtcLeakDetected) {
              const ip = e.candidate.candidate.split(' ')[4];
              if (ip && !ip.startsWith('192.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
                webrtcLeakDetected = true;
                setWebrtcStatus('leak');
                currentScore -= 25;
                factors.push({ name: 'WebRTC IP Leak', value: -25, maxPenalty: 25 });
                vulns.push({
                  id: 'webrtc',
                  name: 'WebRTC IP Leak',
                  icon: '📹',
                  severity: 'critical',
                  description: 'Your real IP address is exposed through WebRTC',
                  impact: 'Websites can see your real IP even behind a VPN'
                });
              }
            }
            setTimeout(() => resolve(), 1000);
          };
        });
        
        if (!webrtcLeakDetected) {
          setWebrtcStatus('secure');
        }
      } catch {
        setWebrtcStatus('secure');
      }

      // 2. Do Not Track (-10)
      const dntEnabled = navigator.doNotTrack === '1';
      if (!dntEnabled) {
        currentScore -= 10;
        factors.push({ name: 'Do Not Track Disabled', value: -10, maxPenalty: 10 });
        vulns.push({
          id: 'dnt',
          name: 'Tracking Protection Off',
          icon: '👁️',
          severity: 'high',
          description: 'Do Not Track is not enabled',
          impact: 'Websites can track you across the internet'
        });
      }

      // 3. Cookies Enabled (-8)
      if (navigator.cookieEnabled) {
        currentScore -= 8;
        factors.push({ name: 'Cookies Enabled', value: -8, maxPenalty: 8 });
        vulns.push({
          id: 'cookies',
          name: 'Cookies Enabled',
          icon: '🍪',
          severity: 'medium',
          description: 'Third-party cookies are allowed',
          impact: 'Trackers can build a profile of your browsing habits'
        });
      }

      // 4. Geolocation API (-12)
      if ('geolocation' in navigator) {
        currentScore -= 12;
        factors.push({ name: 'Geolocation API Available', value: -12, maxPenalty: 12 });
        vulns.push({
          id: 'geo',
          name: 'Geolocation API Exposed',
          icon: '📍',
          severity: 'critical',
          description: 'Browser exposes precise GPS location',
          impact: 'Sites can request your exact physical location'
        });
      }

      // 5. Canvas Fingerprinting (-8)
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Privacy test', 2, 2);
          const data = canvas.toDataURL();
          if (data.length > 100) {
            currentScore -= 8;
            factors.push({ name: 'Canvas Fingerprintable', value: -8, maxPenalty: 8 });
            vulns.push({
              id: 'canvas',
              name: 'Canvas Fingerprinting',
              icon: '🎨',
              severity: 'high',
              description: 'Your browser canvas is unique',
              impact: 'Sites can create a unique fingerprint to track you'
            });
          }
        }
      } catch {
        // Canvas blocked
      }

      // 6. Screen Resolution (-5)
      if (window.screen.width > 1920 || window.screen.height > 1080) {
        currentScore -= 5;
        factors.push({ name: 'Unique Screen Resolution', value: -5, maxPenalty: 5 });
      }

      // 7. Timezone Exposed (-4)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        currentScore -= 4;
        factors.push({ name: 'Timezone Exposed', value: -4, maxPenalty: 4 });
      }

      // 8. LocalStorage Available (-6)
      if (typeof Storage !== 'undefined') {
        currentScore -= 6;
        factors.push({ name: 'LocalStorage Available', value: -6, maxPenalty: 6 });
        vulns.push({
          id: 'storage',
          name: 'Persistent Storage',
          icon: '💾',
          severity: 'medium',
          description: 'Sites can store data permanently',
          impact: 'Trackers can save identifiers even after clearing cookies'
        });
      }

      // 9. Referrer Header (-3)
      if (document.referrer) {
        currentScore -= 3;
        factors.push({ name: 'Referrer Leaked', value: -3, maxPenalty: 3 });
      }

      // 10. JavaScript Enabled (-5)
      currentScore -= 5;
      factors.push({ name: 'JavaScript Enabled', value: -5, maxPenalty: 5 });

      // Calculate fingerprint
      const fp = {
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: timezone,
        languages: navigator.languages?.join(', ') || navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent.split(' ')[0],
        cores: navigator.hardwareConcurrency || 'unknown',
        memory: (navigator as any).deviceMemory || 'unknown',
      };
      setFingerprint(fp);

      // Fetch IP data with fallback services
      const fetchIP = async () => {
        const services = [
          'https://api.ipify.org?format=json',
          'https://ipapi.co/json/',
          'https://api64.ipify.org?format=json'
        ];
        
        for (const service of services) {
          try {
            const res = await fetch(service, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              const ip = data.ip || data.query || data.origin;
              if (ip) {
                setIpData({ ip });
                return;
              }
            }
          } catch {
            // Try next service
          }
        }
        setIpData({ ip: 'Connection error' });
      };
      fetchIP();

      // Ensure score is never below 0
      currentScore = Math.max(0, currentScore);

      // Store everything
      localStorage.setItem('privacyScore', currentScore.toString());
      localStorage.setItem('privacyScoreTimestamp', Date.now().toString());
      localStorage.setItem('privacyScoreFactors', JSON.stringify(factors));
      localStorage.setItem('privacyVulnerabilities', JSON.stringify(vulns));
      localStorage.setItem('webrtcStatus', webrtcStatus);

      setScore(currentScore);
      setScoreFactors(factors);
      setVulnerabilities(vulns);
      setLoading(false);
    };

    gatherBrowserData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-700 bg-red-900/20 text-red-400';
      case 'high': return 'border-orange-700 bg-orange-900/20 text-orange-400';
      case 'medium': return 'border-yellow-700 bg-yellow-900/20 text-yellow-400';
      default: return 'border-slate-700 bg-slate-800';
    }
  };

  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
  const highVulns = vulnerabilities.filter(v => v.severity === 'high');
  const mediumVulns = vulnerabilities.filter(v => v.severity === 'medium');

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Personal Privacy Scanner</h1>
        <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
          Check your digital privacy in less than 60 seconds
        </p>

        {/* Score + VPNs Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Left VPNs */}
          <div className="lg:w-1/4 flex flex-row lg:flex-col gap-3">
            <a href="https://nordvpn.com/" target="_blank" rel="noopener" 
               className="flex-1 bg-gradient-to-br from-blue-900/30 to-slate-800 p-4 rounded-xl border border-blue-700/50 hover:border-blue-500 transition-all hover:scale-105 flex flex-col justify-center items-center text-center">
              <span className="text-2xl mb-1">🛡️</span>
              <h4 className="font-semibold text-blue-400 text-sm">NordVPN</h4>
              <p className="text-xs text-slate-400">68% OFF</p>
              <p className="text-[10px] text-slate-500">Best Overall</p>
            </a>
            <a href="https://www.expressvpn.com/" target="_blank" rel="noopener"
               className="flex-1 bg-gradient-to-br from-purple-900/30 to-slate-800 p-4 rounded-xl border border-purple-700/50 hover:border-purple-500 transition-all hover:scale-105 flex flex-col justify-center items-center text-center">
              <span className="text-2xl mb-1">⚡</span>
              <h4 className="font-semibold text-purple-400 text-sm">ExpressVPN</h4>
              <p className="text-xs text-slate-400">49% OFF</p>
              <p className="text-[10px] text-slate-500">Fastest</p>
            </a>
          </div>

          {/* Center Score Card */}
          <div className="flex-1 bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Privacy Score</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <div className="relative inline-block">
                  <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke={score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${score * 2.83} 283`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold" style={{ color: score > 80 ? '#4ade80' : score > 50 ? '#fbbf24' : '#ef4444' }}>
                      {score}
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 mt-4 mb-4">
                  {score > 80 ? 'Good privacy protection!' : score > 50 ? 'Some vulnerabilities detected' : 'Critical privacy risks found'}
                </p>

                {/* VPN Recommendation - No Score Breakdown */}
                <div className={`p-3 rounded-lg text-sm ${score < 70 ? 'bg-red-900/20 border border-red-700/50' : score < 85 ? 'bg-orange-900/20 border border-orange-700/50' : 'bg-green-900/20 border border-green-700/50'}`}>
                  {score < 70 ? (
                    <div>
                      <p className="text-red-400 font-medium mb-1">🚨 Your privacy is at risk!</p>
                      <p className="text-slate-400 text-xs">
                        {criticalVulns.length} critical and {highVulns.length} high-risk vulnerabilities detected. 
                        A VPN will encrypt your traffic and prevent IP tracking.
                      </p>
                    </div>
                  ) : score < 85 ? (
                    <div>
                      <p className="text-orange-400 font-medium mb-1">⚠️ Privacy improvements needed</p>
                      <p className="text-slate-400 text-xs">
                        Consider a VPN to hide your IP and encrypt your browsing activity.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-400 font-medium mb-1">✅ Good protection!</p>
                      <p className="text-slate-400 text-xs">
                        Keep your VPN active to maintain this protection.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right VPNs */}
          <div className="lg:w-1/4 flex flex-row lg:flex-col gap-3">
            <a href="https://www.surfshark.com/" target="_blank" rel="noopener"
               className="flex-1 bg-gradient-to-br from-teal-900/30 to-slate-800 p-4 rounded-xl border border-teal-700/50 hover:border-teal-500 transition-all hover:scale-105 flex flex-col justify-center items-center text-center">
              <span className="text-2xl mb-1">🔒</span>
              <h4 className="font-semibold text-teal-400 text-sm">Surfshark</h4>
              <p className="text-xs text-slate-400">81% OFF</p>
              <p className="text-[10px] text-slate-500">Unlimited</p>
            </a>
            <Link href={`/personal/vpn-recommendations?score=${score}`}
                  className="flex-1 bg-gradient-to-br from-slate-800 to-slate-700 p-4 rounded-xl border border-slate-600 hover:border-slate-400 transition-all hover:scale-105 flex flex-col justify-center items-center text-center group">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">➕</span>
              <h4 className="font-semibold text-slate-300 text-sm">See More</h4>
              <p className="text-xs text-slate-500">12+ VPNs</p>
              <p className="text-[10px] text-slate-600">Compare</p>
            </Link>
          </div>
        </div>

        {/* Test Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {/* IP Test */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
              🌐 Public IP
              <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded">EXPOSED</span>
            </h3>
            <p className="text-base sm:text-lg font-mono break-all text-red-400">{ipData?.ip || 'Loading...'}</p>
          </div>

          {/* WebRTC Test */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
              📹 WebRTC
              {webrtcStatus === 'leak' ? (
                <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-0.5 rounded">LEAKING</span>
              ) : (
                <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded">SECURE</span>
              )}
            </h3>
            <p className={webrtcStatus === 'leak' ? 'text-red-400' : 'text-green-400'}>
              {webrtcStatus === 'checking' ? 'Checking...' : webrtcStatus === 'leak' ? '⚠️ IP Leak Detected' : '✅ Secure'}
            </p>
          </div>

          {/* Fingerprint */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
              👆 Browser Fingerprint
              <span className="text-[10px] bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded">UNIQUE</span>
            </h3>
            {fingerprint && (
              <ul className="text-sm text-slate-400 space-y-1">
                <li>Screen: {fingerprint.screen}</li>
                <li>Timezone: {fingerprint.timezone}</li>
                <li>Platform: {fingerprint.platform}</li>
                <li>Cores: {fingerprint.cores}</li>
              </ul>
            )}
          </div>

          {/* Security Check */}
          <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">🔒 Security Checks</h3>
            <ul className="text-sm space-y-1">
              <li className="flex justify-between">
                <span className="text-slate-400">HTTPS</span>
                <span className={isSecure ? 'text-green-400' : 'text-red-400'}>
                  {isSecure ? '✅ Secure' : '❌ Not Secure'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Third-party Cookies</span>
                <span className="text-red-400">⚠️ Enabled</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Tracking Protection</span>
                <span className={isDoNotTrack ? 'text-green-400' : 'text-red-400'}>
                  {isDoNotTrack ? '✅ On' : '❌ Off'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Vulnerabilities Grid - Before Website CTA */}
        {vulnerabilities.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vulnerabilities.map(vuln => (
                <div key={vuln.id} className={`rounded-lg p-3 border ${getSeverityColor(vuln.severity)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{vuln.icon}</span>
                    <span className="font-medium text-sm">{vuln.name}</span>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded uppercase ${
                      vuln.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                      vuln.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>{vuln.severity}</span>
                  </div>
                  <p className="text-xs opacity-80">{vuln.description}</p>
                  <p className="text-xs opacity-60 mt-1">{vuln.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Retention Notice */}
        <div className="mb-6 bg-blue-900/20 border border-blue-700 rounded-xl p-4">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <span>🔒</span> Your Privacy Matters
          </h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>✓ No personal data stored on our servers</li>
            <li>✓ Scan results stored locally on your device only</li>
            <li>✓ Auto-deletes after 24 hours</li>
            <li>✓ Clear anytime via browser settings</li>
          </ul>
        </div>

        {/* Cross-promo CTA */}
        <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4 sm:p-6">
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
      </main>
    </>
  );
}
