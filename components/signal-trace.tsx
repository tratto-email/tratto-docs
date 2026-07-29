'use client';

import { useEffect, useId, useRef } from 'react';

const HOVER_RADIUS = 180; // px — distance at which the trace starts bending toward the cursor
const LERP_SPEED = 0.12; // per-frame interpolation toward target distortion

interface Props {
  className?: string;
  /** Section readout, e.g. "DOCS/01 · READY" — terminal/system voice, not translated copy. */
  label: string;
  /**
   * Mounts cursor-proximity distortion (mousemove + SVG filter). Reserved
   * for sections that hold `[data-signal-hover]` elements — every other
   * section gets the scroll-parallax for free from pure CSS, no JS needed.
   */
  interactive?: boolean;
}

/**
 * Ported 1:1 from `tratto-email/tratto`'s marketing hero (`SignalTrace.tsx`)
 * — the Tratto mark reinterpreted as an oscilloscope trace, one instance per
 * section, absolutely positioned within it. Scroll parallax is a pure CSS
 * scroll-timeline animation (`.signal-trace__line` in globals.css).
 *
 * `interactive` wires cursor-proximity distortion via an SVG displacement
 * filter, driven by direct attribute updates (not CSS custom properties —
 * filter primitives don't reliably read `var()`). Skipped entirely under
 * `prefers-reduced-motion: reduce`, leaving the filter at its scale=0
 * default.
 */
export function SignalTrace({ className = '', label, interactive = false }: Props) {
  const displaceRef = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    if (!interactive) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetIntensity = 0;
    let currentIntensity = 0;
    let rafId = 0;

    function onPointerMove(e: PointerEvent) {
      let minDist = Infinity;
      document.querySelectorAll('[data-signal-hover]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (d < minDist) minDist = d;
      });
      targetIntensity = minDist < HOVER_RADIUS ? 1 - minDist / HOVER_RADIUS : 0;
    }

    function tick() {
      currentIntensity += (targetIntensity - currentIntensity) * LERP_SPEED;
      displaceRef.current?.setAttribute('scale', (currentIntensity * 26).toFixed(2));
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [interactive]);

  const filterId = `signal-distort-${useId()}`;

  return (
    <div className={`signal-trace ${className}`}>
      <svg className="signal-trace__svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" fill="none">
        {interactive && (
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        )}
        <g filter={interactive ? `url(#${filterId})` : undefined}>
          <line className="signal-trace__line signal-trace__line--1" x1="20" y1="260" x2="130" y2="20" strokeWidth="30" strokeLinecap="round" />
          <line className="signal-trace__line signal-trace__line--2" x1="150" y1="260" x2="260" y2="20" strokeWidth="26" strokeLinecap="round" />
          <line className="signal-trace__line signal-trace__line--3" x1="280" y1="260" x2="380" y2="20" strokeWidth="14" strokeLinecap="round" />
        </g>
      </svg>
      <span className="signal-trace__readout">{label}</span>
    </div>
  );
}
