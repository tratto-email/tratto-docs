declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export const PREFS_KEY = 'tratto_cookie_prefs';

export const OPEN_PREFS_EVENT = 'tratto:open-cookie-prefs';
export const PREFS_SAVED_EVENT = 'tratto:prefs-saved';
// Fired every time consent changes (banner accept/decline, or modal save)
// with the resulting analytics decision — GoogleTagManager listens for
// this to know when it's allowed to inject the GTM container script.
export const CONSENT_UPDATED_EVENT = 'tratto:consent-updated';

export interface CookiePrefs {
  necessary: true;
  analytics: boolean;
}

export function getStoredPrefs(): CookiePrefs | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookiePrefs;
  } catch {
    return null;
  }
}

export function savePrefs(prefs: CookiePrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function pushConsentUpdate(analytics: boolean): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: 'denied',
  });
  if (analytics) {
    window.dataLayer.push({ event: 'cookie_consent_accepted' });
  }
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: { analytics } }));
}

export function openCookiePreferences(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT));
}
