import Script from 'next/script'

import { MetaPageViews } from './MetaPageViews'

import type { TrackingTagData } from '../api/getTrackingTags'

// The vendors' standard snippets. Ids are checked against their format when saved in the admin, and are
// passed through JSON.stringify, so nothing else reaches the inline scripts.
const ids = (tags: TrackingTagData[], type: TrackingTagData['type']) =>
  tags.filter((tag) => tag.type === type).map((tag) => tag.tagId)

export function TrackingTags({ tags }: { tags: TrackingTagData[] }) {
  const gtm = ids(tags, 'gtm')
  const gtag = ids(tags, 'gtag')
  const meta = ids(tags, 'meta')

  return (
    <>
      {gtm.map((id) => (
        <Script key={id} id={`gtm-${id}`} strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`}
        </Script>
      ))}

      {gtag.length > 0 && (
        <>
          {/* One gtag.js library for every Google tag (Analytics, Ads); each id gets its own config. */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtag[0])}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtag.map((id) => `gtag('config',${JSON.stringify(id)});`).join('')}`}
          </Script>
        </>
      )}

      {meta.length > 0 && <MetaPageViews />}
      {meta.length > 0 && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');${meta.map((id) => `fbq('init',${JSON.stringify(id)});`).join('')}fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}

// Tag Manager's fallback for browsers without JavaScript, at the start of <body>.
export function TrackingNoscript({ tags }: { tags: TrackingTagData[] }) {
  return ids(tags, 'gtm').map((id) => (
    <noscript key={id}>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  ))
}
