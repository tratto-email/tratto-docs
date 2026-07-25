import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@/lib/i18n';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  // The locale prefix is always explicit: /en/…, /it/…
  localePrefix: 'always',
});
