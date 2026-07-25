import { loader } from 'fumadocs-core/source';
import { docs } from '@/.source';
import { i18n } from './i18n';

const mdxSource = docs.toFumadocsSource();

/**
 * fumadocs-mdx@11 returns `files` as a lazy factory at runtime, while
 * fumadocs-core@15 still expects a plain array (and types it as one). The
 * payload is identical either way, so we normalise it here rather than pinning
 * an older, unmaintained mdx release.
 */
const rawFiles: unknown = mdxSource.files;
const files =
  typeof rawFiles === 'function'
    ? (rawFiles as () => typeof mdxSource.files)()
    : mdxSource.files;

export const source = loader({
  baseUrl: '/docs',
  source: { files },
  i18n,
});

/**
 * Pages without a translation fall back to the default language, so `/it/docs/x`
 * can serve English content. `page.path` keeps the source file's locale prefix
 * (`en/x.mdx`), which is how we tell a real translation from a fallback.
 */
export function sourceLocaleOf(page: { path: string }): string {
  return page.path.split('/')[0];
}

export function hasTranslation(slug: string[] | undefined, locale: string): boolean {
  const page = source.getPage(slug, locale);
  return page !== undefined && sourceLocaleOf(page) === locale;
}
