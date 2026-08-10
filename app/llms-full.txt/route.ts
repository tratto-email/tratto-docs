import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { source, hasTranslation } from '@/lib/source';
import { absoluteUrl, docsPath } from '@/lib/site';

export const revalidate = false;
export const dynamic = 'force-static';

/**
 * `/llms-full.txt` — the whole documentation inlined as one markdown file.
 *
 * The companion to `/llms.txt`: that one is the map (titles, URLs, one-line
 * descriptions) and costs a model a handful of follow-up fetches to answer
 * anything concrete. This one is the book — a developer asking an assistant
 * "how do I send an email with Tratto" gets an answer from the real content,
 * with the actual field names, instead of whatever the model reconstructs
 * from a page it guessed at.
 *
 * Size is what makes this viable: the English docs are ~170 KB / ~29k tokens,
 * so the file fits inside any current model's context whole, with no
 * truncation. Revisit the approach if the docs grow several times over —
 * past a few hundred thousand tokens, a single blob stops being useful and
 * per-page markdown would serve better.
 *
 * English only, same reasoning as llms.txt: Italian pages without a
 * translation fall back to English, so including both locales would mostly
 * duplicate content for a consumer whose constraint is context size.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'en');

/** Strips the YAML frontmatter block; the title/description are re-emitted as markdown. */
function stripFrontmatter(raw: string): string {
  if (!raw.startsWith('---')) return raw.trim();
  const end = raw.indexOf('\n---', 3);
  return end === -1 ? raw.trim() : raw.slice(end + 4).trim();
}

export async function GET(): Promise<Response> {
  const pages = source
    .getPages('en')
    .filter((page) => hasTranslation(page.slugs, 'en'))
    .sort((a, b) => a.url.localeCompare(b.url));

  const parts = [
    '# Tratto — full documentation',
    '',
    '> Multi-tenant SaaS for transactional and marketing email. REST API at',
    '> https://api.tratto.email/v1/, authenticated with `Authorization: Bearer <api_key>`.',
    '> Official SDKs: `@tratto/email` (npm) and `tratto-email` (PyPI).',
    '',
    `> Generated from the published documentation. Canonical HTML: ${absoluteUrl('/en/docs')}`,
    '',
    '---',
    '',
  ];

  for (const page of pages) {
    // page.path keeps the locale prefix, e.g. "en/quickstart.mdx".
    const filename = page.path.replace(/^en\//, '');
    let body: string;
    try {
      body = stripFrontmatter(await readFile(path.join(CONTENT_DIR, filename), 'utf8'));
    } catch {
      // A page listed by the loader but unreadable on disk shouldn't take the
      // whole file down — skip it and keep the rest usable.
      continue;
    }

    parts.push(
      `# ${page.data.title ?? page.slugs.join('/')}`,
      '',
      `Source: ${absoluteUrl(docsPath('en', page.slugs))}`,
      '',
    );
    if (page.data.description) parts.push(`> ${page.data.description}`, '');
    parts.push(body, '', '---', '');
  }

  return new Response(parts.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
