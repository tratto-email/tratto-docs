import type { MetadataRoute } from 'next';
import { absoluteUrl, isProductionSite } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Staging must never end up in the index — it serves the same content as prod.
  if (!isProductionSite) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl(''),
  };
}
