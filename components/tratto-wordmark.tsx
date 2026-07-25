import { TrattoMark } from './tratto-mark';

/**
 * Topbar lockup: the Tratto mark, the name, and the section label.
 *
 * The mark is the real brand artwork. The lettering uses --font-display at the
 * brand's own scale; if a locked-up wordmark exists it should replace the text
 * span here.
 */
export function TrattoWordmark({ label = 'Docs' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <TrattoMark height={18} />
      <span
        className="text-[15px] leading-none"
        style={{
          fontFamily: 'var(--font-display)',
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
