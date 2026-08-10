import { source, hasTranslation } from '@/lib/source';
import { absoluteUrl, docsPath, marketingUrl } from '@/lib/site';

export const revalidate = false;
export const dynamic = 'force-static';

/**
 * `/llms.txt` — a plain-markdown index of the documentation, addressed to
 * language models rather than to browsers or search crawlers.
 *
 * An LLM that lands on a docs site has to spend its context reconstructing the
 * shape of it: fetching HTML pages full of navigation, scripts and styling to
 * recover a few paragraphs of prose. This file skips that: one request returns
 * the full map of the documentation, each entry a title, an absolute URL and a
 * one-line description, so the model can decide what to fetch instead of
 * guessing. See https://llmstxt.org for the convention.
 *
 * Only English pages are listed. Italian pages without a translation fall back
 * to English (see lib/source.ts), so enumerating both locales would mostly
 * duplicate the same content under two URLs — noise for a consumer whose whole
 * problem is a limited context window.
 *
 * Note: this file describes the docs; it does not grant access to them.
 * Crawler permission is decided by robots.txt (currently Cloudflare-managed,
 * and blocking several AI crawlers — see GO-LIVE R42).
 */

const DESCRIPTION = [
  'Tratto is a multi-tenant SaaS platform for transactional and marketing email:',
  'a REST API, official SDKs, domain authentication, campaigns, automation flows',
  'and delivery analytics. The API base URL is https://api.tratto.email/v1/ and',
  'every request authenticates with `Authorization: Bearer <api_key>`.',
].join(' ');

export function GET(): Response {
  const pages = source
    .getPages('en')
    .filter((page) => hasTranslation(page.slugs, 'en'))
    .sort((a, b) => a.url.localeCompare(b.url));

  const lines = [
    '# Tratto',
    '',
    `> ${DESCRIPTION}`,
    '',
    '## Documentation',
    '',
  ];

  for (const page of pages) {
    const title = page.data.title ?? page.slugs.join('/');
    const url = absoluteUrl(docsPath('en', page.slugs));
    const summary = page.data.description ? `: ${page.data.description}` : '';
    lines.push(`- [${title}](${url})${summary}`);
  }

  lines.push(
    '',
    '## Reference',
    '',
    `- [API reference](${absoluteUrl('/en/docs/api-reference')}): every endpoint, generated from the OpenAPI spec.`,
    `- [OpenAPI specification](${absoluteUrl('/openapi.json')}): the machine-readable contract, kept in sync with the API at build time.`,
    '',
    '## Optional',
    '',
    `- [Tratto website](${marketingUrl}): product overview, pricing and blog.`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
