const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

// Additional security headers
const securityHeaders = [
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: cspHeader.replace(/\n/g, ''), // Minimize CSP for use in headers
  },
  // X-Content-Type-Options: Prevent MIME sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // X-Frame-Options: Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Referrer-Policy: Control referrer information sent with requests
  {
    key: 'Referrer-Policy',
    value: 'no-referrer',
  },
  // X-XSS-Protection: Mitigate reflected XSS attacks (outdated, but still usable for older browsers)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
