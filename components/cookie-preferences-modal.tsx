'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  OPEN_PREFS_EVENT,
  PREFS_SAVED_EVENT,
  getStoredPrefs,
  savePrefs,
  pushConsentUpdate,
  type CookiePrefs,
} from '@/lib/cookie-prefs';

interface Props {
  t: {
    title: string;
    save: string;
    cancel: string;
    necessaryName: string;
    necessaryDescription: string;
    analyticsName: string;
    analyticsDescription: string;
    alwaysOn: string;
  };
}

export function CookiePreferencesModal({ t }: Props) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const openModal = useCallback(() => {
    const stored = getStoredPrefs();
    setAnalytics(stored?.analytics ?? false);
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(OPEN_PREFS_EVENT, openModal);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, openModal);
  }, [openModal]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function save() {
    const prefs: CookiePrefs = { necessary: true, analytics };
    savePrefs(prefs);
    pushConsentUpdate(analytics);
    window.dispatchEvent(new CustomEvent(PREFS_SAVED_EVENT));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
      aria-label={t.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-fd-background/85"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-[480px] border border-fd-border bg-fd-background">
        <div className="border-b border-fd-border px-8 py-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-fd-foreground">
            {t.title}
          </h2>
        </div>

        <div className="divide-y divide-fd-border">
          {/* Necessary */}
          <div className="flex items-start gap-6 px-8 py-6">
            <div className="flex-1">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.06em] text-fd-foreground">
                {t.necessaryName}
              </p>
              <p className="text-[13px] leading-[1.6] text-fd-muted-foreground">
                {t.necessaryDescription}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-score)]">
                {t.alwaysOn}
              </span>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-start gap-6 px-8 py-6">
            <div className="flex-1">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.06em] text-fd-foreground">
                {t.analyticsName}
              </p>
              <p className="text-[13px] leading-[1.6] text-fd-muted-foreground">
                {t.analyticsDescription}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={analytics}
              onClick={() => setAnalytics((v) => !v)}
              className="relative mt-0.5 h-6 w-10 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-score)]"
              style={{ borderRadius: '999px', background: analytics ? 'var(--color-score)' : 'var(--color-fd-muted)' }}
            >
              <span
                className="absolute top-1 block h-4 w-4 bg-white transition-transform"
                style={{
                  borderRadius: '50%',
                  left: '4px',
                  transform: analytics ? 'translateX(16px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-fd-border px-8 py-5">
          <button
            onClick={() => setOpen(false)}
            className="h-9 px-4 font-mono text-[11px] uppercase tracking-[0.06em] text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            {t.cancel}
          </button>
          <button
            onClick={save}
            className="h-9 bg-[var(--color-score)] px-5 font-mono text-[11px] uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
