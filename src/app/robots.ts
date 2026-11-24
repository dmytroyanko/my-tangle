import type { MetadataRoute } from 'next'

import { siteUrl } from '@/shared/config'

// The admin and the Payload API are not for search engines, but product photos are served from the API
// (/api/media/file/…) and must stay open for image search, rich results and link previews: the longer
// Allow rule wins over Disallow: /api. Filtered addresses (?color=, ?series=) stay open: their canonical
// points to the clean URL, which is how search engines learn to merge them.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: ['/', '/api/media/'], disallow: ['/admin', '/api'] },
    sitemap: new URL('/sitemap.xml', siteUrl).href,
    host: siteUrl,
  }
}
