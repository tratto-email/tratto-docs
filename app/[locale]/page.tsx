import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { notFound } from 'next/navigation';

import { locales, toLocale } from '@/lib/i18n';
import { docsPath } from '@/lib/site';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  if (!locale) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="mx-auto flex w-full max-w-[1060px] flex-1 flex-col justify-center px-6 py-24">
      <p className="tratto-eyebrow mb-4">{t('eyebrow')}</p>
      <h1
        className="mb-5 text-5xl leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {t('title')}
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-fd-muted-foreground">
        {t('subtitle')}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={docsPath(locale, ['quickstart'])}
          className="bg-fd-primary px-6 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          {t('ctaPrimary')}
        </Link>
        <Link
          href={`/${locale}/docs/api-reference`}
          className="border border-fd-border px-6 py-3 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          {t('ctaSecondary')}
        </Link>
      </div>
    </main>
  );
}
