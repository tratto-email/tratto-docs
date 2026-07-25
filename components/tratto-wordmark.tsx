/**
 * Tratto wordmark — mirrors the `TrattoWordmark` component on tratto.email.
 * The "score" (the vermiglio underline) is the brand's signature mark.
 */
export function TrattoWordmark({ label = 'Docs' }: { label?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="text-[15px] font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Tratto
      </span>
      <span
        aria-hidden
        className="h-[2px] w-3 self-center"
        style={{ background: 'var(--color-score)' }}
      />
      <span className="text-[13px] font-medium text-fd-muted-foreground">
        {label}
      </span>
    </span>
  );
}
