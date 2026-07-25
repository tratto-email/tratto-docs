/**
 * The Tratto mark: three strokes, the first in vermiglio.
 *
 * The brand ships a light-background and a dark-background variant that differ
 * only in the second and third stroke. Rather than switching between two files,
 * those strokes use `currentColor` so the mark inherits whatever it sits on —
 * and the ghost stroke's opacity flips via `--tratto-mark-ghost` in globals.css
 * (0.30 light / 0.35 dark, matching the source files).
 *
 * The vermiglio stroke is constant in both variants and never inherits.
 */
export function TrattoMark({
  height = 18,
  className,
}: {
  height?: number;
  className?: string;
}) {
  // Source artwork is 40×28.
  const width = Math.round((height * 40) / 28);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 28"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <line
        x1="2"
        y1="26"
        x2="13"
        y2="2"
        stroke="var(--color-score)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="26"
        x2="26"
        y2="2"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="26"
        x2="38"
        y2="2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="var(--tratto-mark-ghost, 0.3)"
      />
    </svg>
  );
}
