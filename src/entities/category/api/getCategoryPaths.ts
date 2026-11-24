import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'

// Every category's slug per language and last change, for the sitemap.
export async function getCategoryPaths() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    locale: 'all',
    depth: 0,
    pagination: false,
    joins: false,
    select: { slug: true, updatedAt: true },
  })
  return docs.map((doc) => ({
    slugs: (doc.slug ?? {}) as unknown as Partial<Record<Locale, string | null>>,
    updatedAt: doc.updatedAt,
  }))
}
