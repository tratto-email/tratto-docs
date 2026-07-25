import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { hasTranslation, source } from '@/lib/source';
import { locales, toLocale } from '@/lib/i18n';
import { absoluteUrl, docsPath, repoBranch, repoUrl } from '@/lib/site';
import { getMDXComponents } from '@/mdx-components';
import { Breadcrumbs, buildDocsCrumbs } from '@/components/breadcrumbs';

type PageParams = { locale: string; slug?: string[] };

export function generateStaticParams() {
  return source.generateParams('slug', 'locale');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  if (!locale) notFound();

  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: 'meta' });
  const description = page.data.description ?? t('defaultDescription');

  // Only locales with a real translation get an hreflang entry — an untranslated
  // page falls back to English, and pointing hreflang at it would advertise two
  // URLs for the same content.
  const translated = locales.filter((candidate) =>
    hasTranslation(slug, candidate),
  );
  const languages: Record<string, string> = Object.fromEntries(
    translated.map((l) => [l, absoluteUrl(docsPath(l, slug ?? []))]),
  );
  languages['x-default'] = absoluteUrl(docsPath('en', slug ?? []));

  // For a fallback page the canonical points at the language that actually owns
  // the content, so the duplicate never competes with the original.
  const canonicalLocale = hasTranslation(slug, locale) ? locale : 'en';
  const canonical = docsPath(canonicalLocale, slug ?? []);

  const ogImage = `/api/og?locale=${canonicalLocale}&slug=${(slug ?? []).join('/')}`;

  return {
    title: page.data.title,
    description,
    alternates: { canonical, languages },
    robots: page.data.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: page.data.title,
      description,
      type: 'article',
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  if (!locale) notFound();

  setRequestLocale(locale);

  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: 'page' });
  const nav = await getTranslations({ locale, namespace: 'nav' });

  const MDX = page.data.body;
  const crumbs = buildDocsCrumbs(
    locale,
    slug ?? [],
    nav('docs'),
    page.data.title,
  );

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={page.data.lastModified}
      tableOfContent={{
        style: 'clerk',
        header: <p className="tratto-eyebrow mb-2">{t('onThisPage')}</p>,
      }}
      breadcrumb={{ enabled: false }}
      article={{ className: 'max-w-none' }}
    >
      <Breadcrumbs crumbs={crumbs} label={t('breadcrumb')} />
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
      <hr className="my-8 border-fd-border" />
      <a
        href={`${repoUrl}/blob/${repoBranch}/content/${page.path}`}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-[12px] text-fd-muted-foreground transition-colors hover:text-fd-primary"
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          width="13"
          height="13"
          fill="currentColor"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        {t('editOnGithub')}
      </a>
    </DocsPage>
  );
}
