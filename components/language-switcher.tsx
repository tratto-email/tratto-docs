'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/lib/i18n';

/**
 * EN | IT toggle that keeps the reader on the equivalent page by swapping only
 * the leading locale segment of the current path.
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const t = useTranslations('nav');

  function pathForLocale(target: Locale): string {
    if (!pathname) return `/${target}`;
    const segments = pathname.split('/');
    // segments[0] is the empty string before the leading slash.
    if ((locales as readonly string[]).includes(segments[1])) {
      segments[1] = target;
      return segments.join('/');
    }
    return `/${target}${pathname}`;
  }

  return (
    <div
      className="flex items-center gap-1 text-[12px]"
      role="group"
      aria-label={t('switchLanguage')}
    >
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden className="text-fd-muted-foreground/50">
              |
            </span>
          )}
          <Link
            href={pathForLocale(locale)}
            hrefLang={locale}
            aria-current={locale === active ? 'true' : undefined}
            className={
              locale === active
                ? 'font-semibold text-fd-primary'
                : 'text-fd-muted-foreground hover:text-fd-foreground'
            }
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
