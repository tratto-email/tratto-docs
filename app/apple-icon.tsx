import { ImageResponse } from 'next/og';
import { trattoMarkDataUri } from '@/lib/brand';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * iOS home-screen icon. Apple always composites onto an opaque tile, so this
 * uses the ink background and the dark-background mark.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0D0D0D',
        }}
      >
        <img src={trattoMarkDataUri('dark')} width={116} height={81} alt="" />
      </div>
    ),
    size,
  );
}
