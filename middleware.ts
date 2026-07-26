import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  /**
   * Run on every path except Next internals, the API routes, and anything with
   * a file extension (sitemap.xml, robots.txt, icon.svg…).
   *
   * The generated metadata routes are listed explicitly: they have no file
   * extension, so without this they get a locale prefix and `/apple-icon`
   * redirects to `/en/apple-icon`, which does not exist.
   */
  matcher: [
    '/((?!api|_next|_vercel|apple-icon|opengraph-image|twitter-image|manifest|.*\\..*).*)',
  ],
};
