import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { absoluteUrl, docsPath } from '@/lib/site';

export interface Crumb {
  label: string;
  /** Absolute path; omitted for the current (last) item. */
  href?: string;
}

/**
 * Breadcrumb trail with a schema.org BreadcrumbList so search engines show the
 * docs hierarchy in results. The last item is the current page and is not a link.
 */
export function Breadcrumbs({
  crumbs,
  label,
}: {
  crumbs: Crumb[];
  label: string;
}) {
  if (crumbs.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is trusted here — it is built from our own page tree.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label={label} className="mb-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-fd-muted-foreground">
          {crumbs.map((crumb, index) => (
            <li
              key={`${crumb.label}-${index}`}
              className="flex items-center gap-1.5 last:min-w-0"
            >
              {index > 0 && (
                <span aria-hidden className="text-fd-border">
                  /
                </span>
              )}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-fd-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="block truncate text-fd-foreground"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Builds the crumb trail for a docs page from its slug segments. */
export function buildDocsCrumbs(
  locale: Locale,
  slug: string[],
  rootLabel: string,
  currentTitle: string,
): Crumb[] {
  const crumbs: Crumb[] = [{ label: rootLabel, href: docsPath(locale) }];

  slug.slice(0, -1).forEach((segment, index) => {
    crumbs.push({
      label: humanise(segment),
      href: docsPath(locale, slug.slice(0, index + 1)),
    });
  });

  if (slug.length > 0) crumbs.push({ label: currentTitle });
  return crumbs;
}

function humanise(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
