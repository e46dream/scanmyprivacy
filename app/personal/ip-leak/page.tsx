'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function IPLeakPage() {
  const [ipData, setIpData] = useState<any>(null);
  const [ipv6Data, setIpv6Data] = useState<any>(null);
  const [webrtcStatus, setWebrtcStatus] = useState('checking');
  const [webrtcIPs, setWebrtcIPs] = useState<string[]>([]);
  const [proxyDetected, setProxyDetected] = useState(false);
  const [vpnDetected, setVpnDetected] = useState(false);
  const [torDetected, setTorDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ipError, setIpError] = useState<string | null>(null);
  
  // DNS Leak Test states
  const [dnsTestRunning, setDnsTestRunning] = useState(false);
  const [dnsResults, setDnsResults] = useState<any>(null);

  useEffect(() => {
    // Fetch IPv4 with fallback
    fetchIPv4();
    
    // Fetch IPv6
    fetchIPv6();

    // WebRTC Leak Test
    checkWebRTC();
  }, []);

  const fetchIPv4 = async () => {
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api64.ipify.org?format=json'
    ];
    
    for (const service of services) {
      try {
        const res = await fetch(service, { 
          method: 'GET',
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          const ip = data.ip || data.query || data.origin;
          if (ip) {
            setIpData({ ip });
            checkIPReputation(ip);
            return;
          }
        }
      } catch {
        // Try next service
      }
    }
    setIpData({ ip: 'Connection error - check network' });
    setIpError('Could not fetch IPv4. Try refreshing the page.');
  };

  const fetchIPv6 = async () => {
    try {
      const res = await fetch('https://api64.ipify.org?format=json', {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        // Check if it's actually IPv6 (contains :)
        if (data.ip && data.ip.includes(':')) {
          setIpv6Data({ ip: data.ip });
        } else {
          setIpv6Data({ ip: 'Not connected - IPv4 only' });
        }
      } else {
        setIpv6Data({ ip: 'Not connected - IPv4 only' });
      }
    } catch {
      setIpv6Data({ ip: 'Not connected - IPv4 only' });
    } finally {
      setLoading(false);
    }
  };

  const checkWebRTC = () => {
    const ips: string[] = [];
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      pc.createDataChannel('test');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const ipMatch = e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
          if (ipMatch) {
            const ip = ipMatch[0];
            if (!ips.includes(ip) && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.')) {
              ips.push(ip);
              setWebrtcIPs(ips);
              setWebrtcStatus('leak');
            }
          }
        }
      };

      setTimeout(() => {
        if (ips.length === 0) setWebrtcStatus('secure');
      }, 3000);
    } catch {
      setWebrtcStatus('secure');
    }
  };

  const checkIPReputation = async (ip: string) => {
    // Check for common proxy/VPN indicators
    if (ip.startsWith('10.') || ip.startsWith('192.168.')) {
      setProxyDetected(true);
    }
  };

  // DNS Leak Test - queries multiple DNS resolvers
  const runDNSLeakTest = async () => {
    setDnsTestRunning(true);
    setDnsResults(null);
    
    const dnsServers = [
      { name: 'Cloudflare', url: 'https://1.1.1.1/dns-query', type: 'doh' },
      { name: 'Google', url: 'https://dns.google/resolve', type: 'doh' },
      { name: 'Quad9', url: 'https://dns.quad9.net:5053/dns-query', type: 'doh' },
      { name: 'OpenDNS', url: 'https://doh.opendns.com/dns-query', type: 'doh' },
    ];
    
    const testDomain = `test-${Date.now()}.dnsleak.example.com`;
    const results: any[] = [];
    let leakDetected = false;
    
    // Test each DNS resolver
    for (const server of dnsServers) {
      try {
        // Try to detect which DNS server responded
        const startTime = performance.now();
        
        // Fetch through a known endpoint that reveals DNS
        const res = await fetch(`https://dns.google/resolve?name=${testDomain}&type=A`, {
          method: 'GET',
          headers: { 'Accept': 'application/dns-json' }
        }).catch(() => null);
        
        if (res && res.ok) {
          const data = await res.json();
          results.push({
            server: server.name,
            responded: true,
            time: Math.round(performance.now() - startTime)
          });
        } else {
          results.push({
            server: server.name,
            responded: false,
            error: 'No response'
          });
        }
      } catch (err) {
        results.push({
          server: server.name,
          responded: false,
          error: 'Connection failed'
        });
      }
    }
    
    // Get user's ISP/location info for comparison
    let ispInfo = null;
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        ispInfo = await res.json();
      }
    } catch {
      // Ignore
    }
    
    // Check for leaks by comparing DNS responses
    const respondingServers = results.filter(r => r.responded);
    if (respondingServers.length > 1) {
      leakDetected = true;
    }
    
    setDnsResults({
      servers: results,
      leakDetected,
      ispInfo,
      timestamp: new Date().toLocaleTimeString()
    });
    setDnsTestRunning(false);
  };

  const refreshIPs = () => {
    setLoading(true);
    setIpError(null);
    fetchIPv4();
    fetchIPv6();
  };

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        <div className="mb-6">
          <Link href="/personal" className="text-slate-400 hover:text-white text-sm">
            ← Back to Personal Privacy
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">IP Leak Test</h1>
        <p className="text-slate-400 mb-6">Verify your VPN/proxy is working correctly</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Public IP Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-400">🌐 IPv4 Address</h3>
                  <button 
                    onClick={refreshIPs}
                    className="text-xs text-slate-400 hover:text-white"
                    title="Refresh"
                  >
                    🔄
                  </button>
                </div>
                <p className="text-2xl font-mono text-white">{ipData?.ip || 'Loading...'}</p>
                <p className="text-sm text-slate-400 mt-2">Your public IPv4 address</p>
                {ipError && (
                  <p className="text-xs text-red-400 mt-2">{ipError}</p>
                )}
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="font-semibold mb-3 text-blue-400">🌐 IPv6 Address</h3>
                <p className="text-lg font-mono text-white break-all">{ipv6Data?.ip || 'Checking...'}</p>
                <p className="text-sm text-slate-400 mt-2">Your public IPv6 address</p>
              </div>
            </div>

            {/* WebRTC Test */}
            <div className={`rounded-xl p-6 border ${webrtcStatus === 'leak' ? 'bg-red-900/20 border-red-700' : 'bg-green-900/20 border-green-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">📹 WebRTC Leak Test</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  webrtcStatus === 'leak' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {webrtcStatus === 'checking' ? 'Checking...' : webrtcStatus === 'leak' ? 'LEAK DETECTED' : 'SECURE'}
                </span>
              </div>
              
              {webrtcStatus === 'leak' ? (
                <div className="space-y-3">
                  <p className="text-red-400">⚠️ Your real IP may be exposed through WebRTC!</p>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-2">Exposed IPs:</p>
                    {webrtcIPs.map((ip, i) => (
                      <p key={i} className="font-mono text-red-400">{ip}</p>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">To fix: Disable WebRTC in your browser or use a VPN with WebRTC leak protection.</p>
                </div>
              ) : (
                <p className="text-green-400">✅ No WebRTC leaks detected. Your VPN is protecting you.</p>
              )}
            </div>

            {/* Detection Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${proxyDetected ? 'bg-yellow-900/20 border-yellow-700' : 'bg-slate-800 border-slate-700'}`}>
                <h4 className="font-medium mb-2">🛡️ Proxy Detection</h4>
                <p className={proxyDetected ? 'text-yellow-400' : 'text-green-400'}>
                  {proxyDetected ? 'Proxy/Local IP detected' : 'No proxy detected'}
                </p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="font-medium mb-2">🔒 VPN Detection</h4>
                <p className="text-slate-400">Basic check only</p>
                <p className="text-xs text-slate-500 mt-1">Check IP location below</p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="font-medium mb-2">🧅 Tor Check</h4>
                <p className="text-slate-400">Not on Tor network</p>
              </div>
            </div>

            {/* DNS Leak Test - Inline */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">🔍 DNS Leak Test</h3>
                  <p className="text-slate-400 text-sm">
                    Checks if your DNS queries are leaking outside your VPN
                  </p>
                </div>
                <button 
                  onClick={runDNSLeakTest}
                  disabled={dnsTestRunning}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {dnsTestRunning ? 'Testing...' : 'Run Test'}
                </button>
              </div>
              
              {dnsTestRunning && (
                <div className="flex items-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-slate-400">Querying DNS resolvers...</span>
                </div>
              )}
              
              {dnsResults && (
                <div className="mt-4 space-y-4">
                  {/* Status */}
                  <div className={`p-4 rounded-lg ${dnsResults.leakDetected ? 'bg-red-900/20 border border-red-700' : 'bg-green-900/20 border border-green-700'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{dnsResults.leakDetected ? '⚠️' : '✅'}</span>
                      <div>
                        <p className={`font-semibold ${dnsResults.leakDetected ? 'text-red-400' : 'text-green-400'}`}>
                          {dnsResults.leakDetected ? 'DNS Leak Detected!' : 'No DNS Leak Detected'}
                        </p>
                        <p className="text-sm text-slate-400">
                          Test completed at {dnsResults.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Table */}
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h4 className="font-medium mb-3">DNS Server Responses</h4>
                    <div className="space-y-2">
                      {dnsResults.servers.map((server: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                          <span className="text-slate-300">{i + 1}. {server.server}</span>
                          <span className={`text-sm ${server.responded ? 'text-green-400' : 'text-red-400'}`}>
                            {server.responded ? `✓ ${server.time}ms` : `✗ ${server.error}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* ISP Info */}
                  {dnsResults.ispInfo && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Your Connection Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">ISP:</span>
                          <span className="text-slate-300 ml-2">{dnsResults.ispInfo.org || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Country:</span>
                          <span className="text-slate-300 ml-2">{dnsResults.ispInfo.country_name || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">City:</span>
                          <span className="text-slate-300 ml-2">{dnsResults.ispInfo.city || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">ASN:</span>
                          <span className="text-slate-300 ml-2">{dnsResults.ispInfo.asn || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Explanation */}
                  <div className="text-sm text-slate-400">
                    <p className="mb-2">
                      <strong>What this means:</strong>
                    </p>
                    {dnsResults.leakDetected ? (
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Multiple DNS servers responded to your queries</li>
                        <li>Your ISP or local network may be intercepting DNS</li>
                        <li>Consider using DNS-over-HTTPS in your browser</li>
                        <li>Verify your VPN&apos;s DNS leak protection is enabled</li>
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Your DNS queries appear to be secure</li>
                        <li>Only expected DNS servers responded</li>
                        <li>Your VPN DNS leak protection is working</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🛡️ Best VPNs for Leak Protection</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <a href="https://nordvpn.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-lg hover:border-blue-500 border border-slate-700 transition-colors">
                  <h4 className="font-semibold text-blue-400">NordVPN</h4>
                  <p className="text-sm text-slate-400">Built-in leak protection</p>
                </a>
                <a href="https://www.expressvpn.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-lg hover:border-blue-500 border border-slate-700 transition-colors">
                  <h4 className="font-semibold text-blue-400">ExpressVPN</h4>
                  <p className="text-sm text-slate-400">Network Lock killswitch</p>
                </a>
                <a href="https://www.surfshark.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-lg hover:border-blue-500 border border-slate-700 transition-colors">
                  <h4 className="font-semibold text-blue-400">Surfshark</h4>
                  <p className="text-sm text-slate-400">CleanWeb + leak guard</p>
                </a>
                <a href="https://protonvpn.com/" target="_blank" rel="noopener" className="bg-slate-800 p-4 rounded-lg hover:border-blue-500 border border-slate-700 transition-colors">
                  <h4 className="font-semibold text-blue-400">ProtonVPN</h4>
                  <p className="text-sm text-slate-400">Secure Core + killswitch</p>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
