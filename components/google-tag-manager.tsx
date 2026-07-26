import Script from 'next/script';

interface Props {
  id: string;
}

// Runs inline before any other scripts: sets all consent to denied.
// GTM loads but fires no analytics/ads tags until the user accepts.
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
  return (
    <>
      {/* Must run before GTM to set consent defaults */}
      <Script id="gtm-consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: consentDefault }} />

      <Script id="gtm-init" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
      </Script>

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
