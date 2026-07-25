import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  /**
   * Run on every path except Next internals, the search API and anything with a
   * file extension (sitemap.xml, robots.txt, openapi.json, og images…).
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
