import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'

import { productPrice } from '../model/productPrice'

type Slugs = Partial<Record<Locale, string | null>>

// Every published product that has a page (it has a category and a price, see getProductBySlug and
// productPrice): its slug per language and the last change, for the sitemap. A language without its own
// slug is left out by the sitemap.
export async function getProductPaths() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' }, category: { exists: true } },
    locale: 'all',
    depth: 0,
    pagination: false,
    select: { slug: true, price: true, updatedAt: true },
  })
  return docs.flatMap((doc) =>
    productPrice(doc) === null
      ? []
      : [{ slugs: (doc.slug ?? {}) as unknown as Slugs, updatedAt: doc.updatedAt }],
  )
}
