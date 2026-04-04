import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    // In production, this would perform actual website scanning
    // For demo, return simulated compliance check results
    const checks = [
      { name: 'Cookie consent banner', pass: Math.random() > 0.5 },
      { name: 'Privacy policy present', pass: Math.random() > 0.3 },
      { name: 'HTTPS enabled', pass: true },
      { name: 'GDPR language in policy', pass: Math.random() > 0.6 },
      { name: 'Third-party trackers blocked', pass: Math.random() > 0.4 },
      { name: 'Forms have consent', pass: Math.random() > 0.5 },
      { name: 'Analytics consent mode', pass: Math.random() > 0.3 },
      { name: 'CCPA "Do Not Sell" link', pass: Math.random() > 0.6 },
      { name: 'Data retention policy', pass: Math.random() > 0.5 },
      { name: 'Contact form compliance', pass: Math.random() > 0.4 },
    ];

    const passed = checks.filter(c => c.pass).length;
    const score = Math.round((passed / checks.length) * 100);

    const issues = [];
    
    if (!checks[0].pass) {
      issues.push({
        severity: 'critical',
        title: 'Cookie consent banner missing',
        description: 'Required for GDPR compliance - €20M fine risk'
      });
    }
    
    if (!checks[3].pass) {
      issues.push({
        severity: 'high',
        title: 'Google Analytics loads before consent',
        description: 'Violation of ePrivacy Directive'
      });
    }
    
    if (!checks[1].pass) {
      issues.push({
        severity: 'medium',
        title: 'Privacy policy outdated',
        description: 'Last updated > 12 months ago'
      });
    }

    return NextResponse.json({
      url,
      score,
      checks,
      issues,
      passed,
      total: checks.length,
      scanTime: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to scan website' },
      { status: 500 }
    );
  }
}
