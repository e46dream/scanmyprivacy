'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Expanded news pool - 24 items for hourly rotation
const allNewsItems = [
  {
    id: 1,
    text: "Critical OpenSSH vulnerability affects millions of servers - patch immediately",
    url: "https://thehackernews.com/",
    type: "vulnerability",
  },
  {
    id: 2,
    text: "EU fines major tech company €500M for GDPR violations",
    url: "https://www.cnil.fr/",
    type: "legal",
  },
  {
    id: 3,
    text: "New browser fingerprinting technique discovered - affects all major browsers",
    url: "https://www.schneier.com/",
    type: "privacy",
  },
  {
    id: 4,
    text: "Ransomware group claims attack on healthcare provider - 2TB data stolen",
    url: "https://krebsonsecurity.com/",
    type: "breach",
  },
  {
    id: 5,
    text: "Google expands Privacy Sandbox to block third-party cookies",
    url: "https://www.eff.org/",
    type: "privacy",
  },
  {
    id: 6,
    text: "FTC announces new data broker regulations - mandatory opt-out required",
    url: "https://www.ftc.gov/",
    type: "legal",
  },
  {
    id: 7,
    text: "Apple patches zero-day vulnerability exploited in the wild",
    url: "https://support.apple.com/",
    type: "vulnerability",
  },
  {
    id: 8,
    text: "Signal introduces usernames - no longer requires phone number",
    url: "https://signal.org/",
    type: "feature",
  },
  // Hour 2 batch
  {
    id: 9,
    text: "New AI-powered phishing attacks bypass 2FA - security experts warn",
    url: "https://krebsonsecurity.com/",
    type: "breach",
  },
  {
    id: 10,
    text: "Microsoft releases emergency patch for Windows zero-day",
    url: "https://msrc.microsoft.com/",
    type: "vulnerability",
  },
  {
    id: 11,
    text: "WhatsApp fined €390M for GDPR violations in data sharing",
    url: "https://www.cnil.fr/",
    type: "legal",
  },
  {
    id: 12,
    text: "Tor Browser 13.0 released with enhanced anti-fingerprinting",
    url: "https://blog.torproject.org/",
    type: "feature",
  },
  // Hour 3 batch
  {
    id: 13,
    text: "Major cloud provider suffers data breach - customer credentials exposed",
    url: "https://thehackernews.com/",
    type: "breach",
  },
  {
    id: 14,
    text: "Chrome to block all third-party cookies by end of 2024",
    url: "https://privacysandbox.com/",
    type: "privacy",
  },
  {
    id: 15,
    text: "FBI warns of ransomware targeting critical infrastructure",
    url: "https://www.ic3.gov/",
    type: "breach",
  },
  {
    id: 16,
    text: "New EU cybersecurity directive mandates incident reporting within 24 hours",
    url: "https://digital-strategy.ec.europa.eu/",
    type: "legal",
  },
  // Hour 4 batch
  {
    id: 17,
    text: "Researchers find critical flaw in popular VPN protocols",
    url: "https://www.schneier.com/",
    type: "vulnerability",
  },
  {
    id: 18,
    text: "Meta agrees to pay $725M settlement for privacy lawsuit",
    url: "https://www.eff.org/",
    type: "legal",
  },
  {
    id: 19,
    text: "Firefox adds new tracking protection against bounce tracking",
    url: "https://blog.mozilla.org/",
    type: "feature",
  },
  {
    id: 20,
    text: "Nation-state hackers targeting VPN devices - CISA alert issued",
    url: "https://www.cisa.gov/",
    type: "breach",
  },
  // Hour 5 batch
  {
    id: 21,
    text: "DuckDuckGo Email Protection now blocks hidden email trackers",
    url: "https://spreadprivacy.com/",
    type: "feature",
  },
  {
    id: 22,
    text: "Proton Mail launches encrypted calendar for all users",
    url: "https://proton.me/",
    type: "feature",
  },
  {
    id: 23,
    text: "iOS 17.4 introduces new privacy controls for app tracking",
    url: "https://support.apple.com/",
    type: "privacy",
  },
  {
    id: 24,
    text: "New malware steals passwords from Chrome and Edge browsers",
    url: "https://thehackernews.com/",
    type: "vulnerability",
  },
];

// Get news items based on current hour (rotates every hour)
const getCurrentHourNews = () => {
  const hour = new Date().getHours();
  const startIndex = (hour % 3) * 8; // Rotate between 3 sets of 8 items
  return allNewsItems.slice(startIndex, startIndex + 8);
};

export default function NewsTicker() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState(getCurrentHourNews());

  useEffect(() => {
    // Check for hour change every minute
    const checkHourChange = setInterval(() => {
      const currentHour = new Date().getHours();
      const storedHour = localStorage.getItem('newsTickerHour');
      
      if (storedHour !== currentHour.toString()) {
        localStorage.setItem('newsTickerHour', currentHour.toString());
        setNewsItems(getCurrentHourNews());
        setCurrentIndex(0);
      }
    }, 60000); // Check every minute
    
    // Initial set
    const hour = new Date().getHours();
    localStorage.setItem('newsTickerHour', hour.toString());

    return () => clearInterval(checkHourChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems]);

  if (!isVisible) return null;

  const currentNews = newsItems[currentIndex];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vulnerability':
        return 'text-red-400';
      case 'breach':
        return 'text-orange-400';
      case 'legal':
        return 'text-blue-400';
      case 'privacy':
        return 'text-purple-400';
      case 'feature':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vulnerability':
        return '🚨';
      case 'breach':
        return '🔓';
      case 'legal':
        return '⚖️';
      case 'privacy':
        return '🔒';
      case 'feature':
        return '✨';
      default:
        return '📰';
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              🔔 Latest:
            </span>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg">{getTypeIcon(currentNews.type)}</span>
              <a
                href={currentNews.url}
                target="_blank"
                rel="noopener"
                className={`text-sm truncate hover:underline ${getTypeColor(currentNews.type)}`}
              >
                {currentNews.text}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4 absolute right-4">
            <div className="flex gap-1">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-600 hover:text-slate-400 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
