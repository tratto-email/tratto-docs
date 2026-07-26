'use client';

import { useEffect, useState } from 'react';
import {
  getStoredPrefs,
  savePrefs,
  pushConsentUpdate,
  openCookiePreferences,
  PREFS_SAVED_EVENT,
} from '@/lib/cookie-prefs';
import { marketingUrl } from '@/lib/site';

interface Props {
  locale: string;
  t: {
    message: string;
    accept: string;
    decline: string;
    manage: string;
    privacyLabel: string;
  };
}

export function CookieConsent({ locale, t }: Props) {
  const [decided, setDecided] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredPrefs();
    if (stored !== null) {
      setDecided(true);
      pushConsentUpdate(stored.analytics);
    }
    // Close banner if user saved prefs from the modal
    function onPrefsSaved() {
      setDecided(true);
    }
    window.addEventListener(PREFS_SAVED_EVENT, onPrefsSaved);
    return () => window.removeEventListener(PREFS_SAVED_EVENT, onPrefsSaved);
  }, []);

  function acceptAll() {
    savePrefs({ necessary: true, analytics: true });
    pushConsentUpdate(true);
    setDecided(true);
  }

  function declineAll() {
    savePrefs({ necessary: true, analytics: false });
    pushConsentUpdate(false);
    setDecided(true);
  }

  if (!mounted || decided) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-fd-border bg-fd-background px-8 py-5"
    >
      <div className="mx-auto flex max-w-[1060px] flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <p className="flex-1 text-[13px] leading-[1.6] text-fd-muted-foreground">
          {t.message}{' '}
          <a
            href={`${marketingUrl}/${locale}/privacy`}
            className="text-fd-foreground underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            {t.privacyLabel}
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={openCookiePreferences}
            className="h-9 px-4 font-mono text-[11px] uppercase tracking-[0.06em] text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            {t.manage}
          </button>
          <button
            onClick={declineAll}
            className="h-9 px-4 font-mono text-[11px] uppercase tracking-[0.06em] text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            {t.decline}
          </button>
          <button
            onClick={acceptAll}
            className="h-9 bg-[var(--color-score)] px-5 font-mono text-[11px] uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
