'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FingerprintPage() {
  const [fingerprint, setFingerprint] = useState<any>({});
  const [canvasFingerprint, setCanvasFingerprint] = useState('');
  const [webglInfo, setWebglInfo] = useState<any>({});
  const [fonts, setFonts] = useState<string[]>([]);
  const [plugins, setPlugins] = useState<string[]>([]);
  const [uniqueScore, setUniqueScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectFingerprint = async () => {
      const fp: any = {};

      // Basic browser info
      fp.userAgent = navigator.userAgent;
      fp.platform = navigator.platform;
      fp.language = navigator.language;
      fp.languages = navigator.languages;
      fp.cookieEnabled = navigator.cookieEnabled;
      fp.onLine = navigator.onLine;
      fp.hardwareConcurrency = navigator.hardwareConcurrency;
      fp.deviceMemory = (navigator as any).deviceMemory || 'unknown';
      fp.maxTouchPoints = navigator.maxTouchPoints;

      // Screen info
      fp.screen = {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
      };

      // Timezone
      fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fp.timezoneOffset = new Date().getTimezoneOffset();

      // Canvas fingerprint
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 200;
          canvas.height = 200;
          
          // Draw various elements
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillStyle = '#f60';
          ctx.fillRect(0, 0, 200, 200);
          ctx.fillStyle = '#069';
          ctx.fillText('Fingerprint Test', 10, 10);
          
          const dataUrl = canvas.toDataURL();
          setCanvasFingerprint(dataUrl.substring(0, 50) + '...');
        }
      } catch (e) {
        setCanvasFingerprint('Canvas blocked');
      }

      // WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            setWebglInfo({
              vendor: (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
              renderer: (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            });
          }
        }
      } catch (e) {
        setWebglInfo({ vendor: 'Unknown', renderer: 'Unknown' });
      }

      // Plugins
      if (navigator.plugins) {
        const pluginList = Array.from(navigator.plugins).map(p => p.name);
        setPlugins(pluginList);
      }

      // Font detection (basic)
      const testFonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica'];
      const detected: string[] = [];
      const testString = 'mmmmmmmlillii';
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '72px monospace';
        const defaultWidth = ctx.measureText(testString).width;
        
        testFonts.forEach(font => {
          ctx.font = `72px "${font}", monospace`;
          if (ctx.measureText(testString).width !== defaultWidth) {
            detected.push(font);
          }
        });
      }
      setFonts(detected);

      // Calculate uniqueness score (simplified)
      let score = 0;
      score += fp.hardwareConcurrency ? 10 : 0;
      score += fp.screen ? 15 : 0;
      score += fp.timezone ? 10 : 0;
      score += plugins.length * 5;
      score += fonts.length * 3;
      score += webglInfo.vendor ? 20 : 0;
      score = Math.min(score, 100);
      
      setFingerprint(fp);
      setUniqueScore(score);
      setLoading(false);
    };

    collectFingerprint();
  }, []);

  return (
    <>
      <Navigation />
      <main className="max-w-6xl mx-auto p-3 sm:p-4">
        <div className="mb-6">
          <Link href="/personal" className="text-slate-400 hover:text-white text-sm">
            ← Back to Personal Privacy
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browser Fingerprint Analysis</h1>
        <p className="text-slate-400 mb-6">Your browser leaves unique traces that can identify you across websites</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Uniqueness Score */}
            <div className={`rounded-xl p-6 border ${uniqueScore > 70 ? 'bg-red-900/20 border-red-700' : uniqueScore > 40 ? 'bg-yellow-900/20 border-yellow-700' : 'bg-green-900/20 border-green-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">🎯 Fingerprint Uniqueness</h3>
                <span className={`text-3xl font-bold ${
                  uniqueScore > 70 ? 'text-red-400' : uniqueScore > 40 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {uniqueScore}%
                </span>
              </div>
              <p className="text-slate-300">
                {uniqueScore > 70 
                  ? '⚠️ Your browser is highly unique and easily trackable across websites.'
                  : uniqueScore > 40
                  ? '⚡ Your browser has moderate uniqueness. Some tracking possible.'
                  : '✅ Your browser fingerprint is relatively common. Good privacy!'}
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-blue-400">🖥️ System Information</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-white">{fingerprint.platform}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">CPU Cores:</span>
                    <span className="text-white">{fingerprint.hardwareConcurrency}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Memory:</span>
                    <span className="text-white">{fingerprint.deviceMemory} GB</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Touch Points:</span>
                    <span className="text-white">{fingerprint.maxTouchPoints}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Online:</span>
                    <span className={fingerprint.onLine ? 'text-green-400' : 'text-red-400'}>
                      {fingerprint.onLine ? 'Yes' : 'No'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-purple-400">📱 Screen Properties</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="text-white">{fingerprint.screen?.width} × {fingerprint.screen?.height}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Available:</span>
                    <span className="text-white">{fingerprint.screen?.availWidth} × {fingerprint.screen?.availHeight}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Color Depth:</span>
                    <span className="text-white">{fingerprint.screen?.colorDepth}-bit</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Pixel Depth:</span>
                    <span className="text-white">{fingerprint.screen?.pixelDepth}-bit</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Timezone:</span>
                    <span className="text-white">{fingerprint.timezone}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* WebGL & Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-green-400">🎨 WebGL Information</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-400">Vendor:</span>
                    <span className="text-white text-right">{webglInfo.vendor}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-400">Renderer:</span>
                    <span className="text-white text-right text-xs">{webglInfo.renderer}</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mt-3">GPU info can uniquely identify your device</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-yellow-400">📝 Canvas Fingerprint</h3>
                <p className="text-xs text-slate-400 mb-2">Canvas hash preview:</p>
                <code className="text-xs text-slate-300 break-all">{canvasFingerprint}</code>
                <p className="text-xs text-slate-500 mt-3">Each browser renders canvas slightly differently</p>
              </div>
            </div>

            {/* Plugins & Fonts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-orange-400">🔌 Browser Plugins ({plugins.length})</h3>
                <div className="max-h-32 overflow-y-auto">
                  {plugins.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {plugins.slice(0, 10).map((plugin, i) => (
                        <li key={i} className="text-slate-300">• {plugin}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm">No plugins detected</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-semibold mb-3 text-pink-400">🔤 Detected Fonts ({fonts.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {fonts.map((font, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                      {font}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Installed fonts create a unique profile</p>
              </div>
            </div>

            {/* Privacy Tips */}
            <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-6">
              <h3 className="font-semibold mb-4">🛡️ How to Reduce Fingerprinting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-400">Tor Browser</h4>
                  <p className="text-sm text-slate-400">Best protection - makes all users look identical</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-400">Firefox + Privacy Tweaks</h4>
                  <p className="text-sm text-slate-400">Enable fingerprinting protection in about:config</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-400">Brave Browser</h4>
                  <p className="text-sm text-slate-400">Built-in fingerprint randomization</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-400">Safari (macOS)</h4>
                  <p className="text-sm text-slate-400">Intelligent Tracking Prevention</p>
                </div>
              </div>
            </div>

            {/* User Agent */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="font-semibold mb-3">🌐 User Agent String</h3>
              <code className="text-xs text-slate-400 break-all block bg-slate-900 p-3 rounded">
                {fingerprint.userAgent}
              </code>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
