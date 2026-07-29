import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Staging must never be indexed. Firebase App Hosting sets NEXT_PUBLIC_SITE_URL
 * per backend, so we key off that rather than NODE_ENV.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.tratto.email';
const isProduction = siteUrl === 'https://docs.tratto.email';

// Next's dev-mode HMR/Fast Refresh runtime evaluates modules via `eval()`.
// Without 'unsafe-eval' the browser throws on it and no client component
// ever hydrates in `pnpm dev` — production builds don't eval, so this is
// dev-only and keyed off NODE_ENV, not `isProduction` above (that one
// tracks the deploy target URL, which is unset locally).
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://www.google-analytics.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const config: NextConfig = {
  reactStrictMode: true,
  // Orama ships ESM that webpack mangles when bundled into the server output
  // (it emits a `ReferenceError: id is not defined` at module init).
  serverExternalPackages: ['@orama/orama'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: isProduction
          ? securityHeaders
          : [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(withMDX(config));
