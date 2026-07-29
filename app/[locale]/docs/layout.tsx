import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { LinkItemType } from 'fumadocs-ui/layouts/links';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { notFound } from 'next/navigation';

import { source } from '@/lib/source';
import { i18n, toLocale } from '@/lib/i18n';
import { marketingUrl, repoUrl } from '@/lib/site';
import { TrattoWordmark } from '@/components/tratto-wordmark';
import { LanguageSwitcher } from '@/components/language-switcher';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  if (!locale) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'nav' });

  // Same order as the marketing navigation on tratto.email.
  const links: LinkItemType[] = [
    { text: t('home'), url: marketingUrl, external: true },
    { text: t('docs'), url: `/${locale}/docs`, active: 'nested-url' },
    { text: t('blog'), url: `${marketingUrl}/blog`, external: true },
    {
      type: 'custom',
      secondary: true,
      children: <LanguageSwitcher />,
    },
    {
      type: 'custom',
      secondary: true,
      children: (
        <a
          href={`${marketingUrl}/signup`}
          target="_blank"
          rel="noreferrer noopener"
          className="whitespace-nowrap bg-[var(--color-score)] px-4 py-2 text-[12px] uppercase text-[#fff] transition-opacity hover:opacity-85"
          style={{
            fontWeight: 'var(--weight-semibold)',
            letterSpacing: 'var(--tracking-cta)',
          }}
        >
          {t('getStarted')}
        </a>
      ),
    },
  ];

  return (
    <DocsLayout
      tree={source.getPageTree(locale)}
      i18n={i18n}
      githubUrl={repoUrl}
      links={links}
      // `mode: 'top'` keeps the navbar spanning the full width above the
      // sidebar, matching the marketing site's fixed 52px topbar.
      nav={{
        title: <TrattoWordmark label={t('docs')} />,
        url: `/${locale}/docs`,
        mode: 'top',
      }}
      tabMode="navbar"
      sidebar={{
        defaultOpenLevel: 1,
        collapsible: true,
      }}
    >
      {children}
    </DocsLayout>
  );
}
