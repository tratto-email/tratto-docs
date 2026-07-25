import { ImageResponse } from 'next/og';

import { source } from '@/lib/source';
import { toLocale } from '@/lib/i18n';

export const runtime = 'nodejs';

const SIZE = { width: 1200, height: 630 };

/**
 * Dynamic OG card for a doc page.
 *
 * This lives in a route handler rather than an `opengraph-image` file because
 * Next.js forbids any route segment after an optional catch-all, and the docs
 * pages are served by `docs/[[...slug]]`.
 *
 * Usage: `/api/og?locale=en&slug=guides/send-email`
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = toLocale(searchParams.get('locale') ?? 'en') ?? 'en';
  const slug = (searchParams.get('slug') ?? '')
    .split('/')
    .filter((segment) => segment.length > 0);

  const page = source.getPage(slug, locale);

  const title = page?.data.title ?? 'Tratto Docs';
  const description = page?.data.description;
  const section = slug.length > 1 ? humanise(slug[0]) : 'Documentation';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: '#0d0d0d',
          color: '#f7f4ef',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '28px', height: '4px', background: '#c8382a' }} />
          <div style={{ fontSize: 30, fontWeight: 600 }}>Tratto</div>
          <div style={{ fontSize: 26, color: '#9a9a9a' }}>Docs</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#d35f53',
            }}
          >
            {section}
          </div>
          <div style={{ fontSize: 66, lineHeight: 1.15, maxWidth: '980px' }}>
            {truncate(title, 70)}
          </div>
          {description && (
            <div
              style={{
                fontSize: 26,
                color: '#9a9a9a',
                maxWidth: '900px',
                lineHeight: 1.4,
              }}
            >
              {truncate(description, 130)}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#6b6b6b',
            borderTop: '1px solid #2a2a2a',
            paddingTop: '20px',
          }}
        >
          <div>docs.tratto.email</div>
          <div>{locale.toUpperCase()}</div>
        </div>
      </div>
    ),
    SIZE,
  );
}

function humanise(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
