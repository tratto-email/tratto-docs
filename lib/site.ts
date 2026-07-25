import type { Locale } from './i18n';

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.tratto.email'
).replace(/\/$/, '');

export const isProductionSite = siteUrl === 'https://docs.tratto.email';

/** Marketing site the docs topbar links back to. */
export const marketingUrl = 'https://tratto.email';

export const repoUrl = 'https://github.com/tratto-email/tratto-docs';

/** Branch the "Edit this page" links point at. */
export const repoBranch = 'main';

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Canonical docs path for a page, e.g. `/en/docs/quickstart`.
 * `slug` is the Fumadocs slug array (empty for the docs index).
 */
export function docsPath(locale: Locale, slug: string[] = []): string {
  return slug.length > 0
    ? `/${locale}/docs/${slug.join('/')}`
    : `/${locale}/docs`;
}
