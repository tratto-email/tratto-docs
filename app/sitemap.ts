import type { MetadataRoute } from 'next';

import { hasTranslation, source } from '@/lib/source';
import { locales } from '@/lib/i18n';
import { absoluteUrl, docsPath } from '@/lib/site';

export const revalidate = false;

/**
 * Every non-draft doc page in every locale, plus the locale landing pages and
 * the API reference. Each entry carries the full set of hreflang alternates so
 * Search Console can pair the EN and IT versions.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: absoluteUrl(`/${locale}`),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, absoluteUrl(`/${l}`)]),
        ),
      },
    });

    entries.push({
      url: absoluteUrl(`/${locale}/docs/api-reference`),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, absoluteUrl(`/${l}/docs/api-reference`)]),
        ),
      },
    });
  }

  for (const locale of locales) {
    for (const page of source.getPages(locale)) {
      // Drafts stay out of the index, and so do pages that only exist because
      // they fall back to another language — the original is already listed.
      if (page.data.draft) continue;
      if (!hasTranslation(page.slugs, locale)) continue;

      entries.push({
        url: absoluteUrl(docsPath(locale, page.slugs)),
        lastModified: page.data.updatedAt
          ? new Date(page.data.updatedAt)
          : page.data.lastModified,
        changeFrequency: 'weekly',
        priority: page.slugs.length === 0 ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales
              .filter((l) => hasTranslation(page.slugs, l))
              .map((l) => [l, absoluteUrl(docsPath(l, page.slugs))]),
          ),
        },
      });
    }
  }

  return entries;
}
