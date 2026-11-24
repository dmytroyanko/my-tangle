import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'

// Every published information page's slug per language and last change, for the sitemap.
export async function getPagePaths() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    locale: 'all',
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })
  return docs.map((doc) => ({
    slugs: (doc.slug ?? {}) as unknown as Partial<Record<Locale, string | null>>,
    updatedAt: doc.updatedAt,
  }))
}
