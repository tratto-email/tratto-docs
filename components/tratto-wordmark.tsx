import { TrattoMark } from './tratto-mark';

/**
 * Topbar lockup: the Tratto mark, the name, and the section label.
 *
 * The name is set in --font-body at semibold, matching the header on
 * tratto.email. It is deliberately *not* --font-display: the display serif is
 * for headings, while the lockup uses the body face.
 */
export function TrattoWordmark({ label = 'Docs' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <TrattoMark height={18} />
      <span
        className="text-[16px] leading-none"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          letterSpacing: 'var(--tracking-tight)',
        }}
      >
        Tratto
      </span>
      <span className="text-[13px] leading-none text-fd-muted-foreground">
        {label}
      </span>
    </span>
  );
}
