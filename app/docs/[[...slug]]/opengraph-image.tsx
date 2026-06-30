import { ImageResponse } from 'next/og';
import { getPage } from '@/source';

export const runtime = 'nodejs';
export const alt = 'Tratto Documentation';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface Props {
  params: {
    slug?: string[];
  };
}

export default async function Image({ params }: Props) {
  const page = getPage(params.slug);

  if (!page) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#999',
            }}
          >
            Page not found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const title = page.data.title;
  const section = params.slug?.[0]?.replace(/[a-z]-/g, (m: string) => m.toUpperCase()).replace(/-/g, ' ') || 'Documentation';

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
        }}
      >
        {/* Header with logo/branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            ✉️
          </div>
          <span>Tratto Docs</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Section badge */}
          <div
            style={{
              fontSize: 24,
              color: '#93c5fd',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {section}
          </div>

          {/* Page title */}
          <h1
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              margin: 0,
              lineHeight: '1.2',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            fontSize: 20,
            color: '#9ca3af',
          }}
        >
          <div>docs.tratto.email</div>
          <div>REST API & Email Service Documentation</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
