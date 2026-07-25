import type { I18nConfig } from 'fumadocs-core/i18n';

export const locales = ['en', 'it'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Content lives in `content/<locale>/*.mdx`, so the loader uses the `dir`
 * parser. The locale prefix is always explicit in the URL (`/en/…`, `/it/…`).
 */
export const i18n: I18nConfig<Locale> = {
  languages: [...locales],
  defaultLanguage: defaultLocale,
  parser: 'dir',
  hideLocale: 'never',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Next.js types route `params` as plain strings, so every page narrows the
 * locale segment here before using it.
 */
export function toLocale(value: string): Locale | undefined {
  return isLocale(value) ? value : undefined;
}
