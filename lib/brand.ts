/**
 * Static copies of the Tratto mark for contexts that cannot inherit CSS —
 * the favicon and the OG card, both of which are rasterised on a fixed
 * background. Interactive UI should use `components/tratto-mark.tsx` instead,
 * which adapts to the current theme.
 */

type Variant = 'light' | 'dark';

/** Second and third stroke colour per background. */
const STROKE: Record<Variant, { solid: string; ghostOpacity: number }> = {
  light: { solid: '#0D0D0D', ghostOpacity: 0.3 },
  dark: { solid: '#F7F4EF', ghostOpacity: 0.35 },
};

export const SCORE = '#C8382A';

export function trattoMarkSvg(variant: Variant): string {
  const { solid, ghostOpacity } = STROKE[variant];

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="28" viewBox="0 0 40 28" fill="none">',
    `<line x1="2" y1="26" x2="13" y2="2" stroke="${SCORE}" stroke-width="3.2" stroke-linecap="round"/>`,
    `<line x1="15" y1="26" x2="26" y2="2" stroke="${solid}" stroke-width="3.2" stroke-linecap="round"/>`,
    `<line x1="28" y1="26" x2="38" y2="2" stroke="${solid}" stroke-width="1.6" stroke-linecap="round" opacity="${ghostOpacity}"/>`,
    '</svg>',
  ].join('');
}

/**
 * Satori (the renderer behind ImageResponse) draws SVG only through <img>, so
 * the mark is handed to it as a data URI rather than as JSX.
 */
export function trattoMarkDataUri(variant: Variant): string {
  return `data:image/svg+xml;base64,${Buffer.from(trattoMarkSvg(variant)).toString('base64')}`;
}
