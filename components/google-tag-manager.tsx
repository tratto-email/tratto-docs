'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getStoredPrefs, CONSENT_UPDATED_EVENT } from '@/lib/cookie-prefs';

interface Props {
  id: string;
}

// Runs inline before any other scripts: sets all consent to denied.
// Tiny, first-party, and required by Consent Mode regardless of whether
// GTM itself has loaded yet — safe to run unconditionally.
const consentDefault = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  functionality_storage:'denied',
  personalization_storage:'denied',
  security_storage:'granted',
  wait_for_update:500
});`;

export function GoogleTagManager({ id }: Props) {
  // The GTM container script itself (not just the tags it fires) is only
  // injected once the visitor has actually granted analytics consent —
  // it never loads unconditionally on every page view. See
  // lib/cookie-prefs.ts for where consent is stored/broadcast.
  const [analyticsGranted, setAnalyticsGranted] = useState(false);

  useEffect(() => {
    const stored = getStoredPrefs();
    if (stored?.analytics) {
      setAnalyticsGranted(true);
    }

    function onConsentUpdated(e: Event) {
      const detail = (e as CustomEvent<{ analytics: boolean }>).detail;
      if (detail?.analytics) setAnalyticsGranted(true);
    }
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, []);

  return (
    <>
      {/* Must run before GTM to set consent defaults */}
      <Script id="gtm-consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: consentDefault }} />

      {analyticsGranted && (
        <Script id="gtm-init" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
        </Script>
      )}

      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
