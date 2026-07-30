import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DM_Serif_Display, Inter, JetBrains_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import { defineI18nUI } from 'fumadocs-ui/i18n';

import '@/app/globals.css';
import { i18n, locales, type Locale } from '@/lib/i18n';
import { siteUrl } from '@/lib/site';
import { routing } from '@/i18n/routing';
import { CookieConsent } from '@/components/cookie-consent';
import { CookiePreferencesModal } from '@/components/cookie-preferences-modal';
import { GoogleTagManager } from '@/components/google-tag-manager';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-dm-serif',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: { displayName: 'English' },
    it: {
      displayName: 'Italiano',
      search: 'Cerca',
      searchNoResult: 'Nessun risultato',
      toc: 'In questa pagina',
      tocNoHeadings: 'Nessun titolo',
      lastUpdate: 'Ultimo aggiornamento',
      chooseLanguage: 'Cambia lingua',
      nextPage: 'Successiva',
      previousPage: 'Precedente',
      chooseTheme: 'Tema',
      editOnGithub: 'Modifica su GitHub',
    },
  },
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('siteName'),
      template: `%s - ${t('siteName')}`,
    },
    description: t('defaultDescription'),
    openGraph: {
      siteName: t('siteName'),
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  const tCookieBanner = await getTranslations({ locale, namespace: 'cookieBanner' });
  const tCookiePrefs = await getTranslations({ locale, namespace: 'cookiePrefs' });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerif.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager id={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <NextIntlClientProvider>
          <RootProvider i18n={provider(locale as Locale)}>{children}</RootProvider>
        </NextIntlClientProvider>
        <CookieConsent
          locale={locale}
          t={{
            message: tCookieBanner('message'),
            accept: tCookieBanner('accept'),
            decline: tCookieBanner('decline'),
            manage: tCookieBanner('manage'),
            privacyLabel: tCookieBanner('privacyLabel'),
          }}
        />
        <CookiePreferencesModal
          t={{
            title: tCookiePrefs('title'),
            save: tCookiePrefs('save'),
            cancel: tCookiePrefs('cancel'),
            necessaryName: tCookiePrefs('necessaryName'),
            necessaryDescription: tCookiePrefs('necessaryDescription'),
            analyticsName: tCookiePrefs('analyticsName'),
            analyticsDescription: tCookiePrefs('analyticsDescription'),
            alwaysOn: tCookiePrefs('alwaysOn'),
          }}
        />
      </body>
    </html>
  );
}
