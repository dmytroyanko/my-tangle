import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'

import { variantPrice } from '../model/variantPrice'

type Slugs = Partial<Record<Locale, string | null>>

// Every published product that has a page (a colour with a price, see variantPrice): its slug and its
// category's slug per language, and the last change, for the sitemap.
export async function getProductPaths() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' } },
    locale: 'all',
    depth: 1,
    pagination: false,
    select: { slug: true, category: true, price: true, variants: { price: true }, updatedAt: true },
    // Only the category's slug is needed, not its texts in every language.
    populate: { categories: { slug: true } },
  })
  return docs.flatMap((doc) => {
    // A deleted category leaves null, an unpopulated one its id: no page either way.
    const category = doc.category as unknown as { slug?: Slugs } | number | null
    const priced = (doc.variants ?? []).some((variant) => variantPrice(variant, doc) !== null)
    if (!priced || !category || typeof category === 'number' || !category.slug) return []
    return {
      slugs: (doc.slug ?? {}) as unknown as Slugs,
      categorySlugs: category.slug,
      updatedAt: doc.updatedAt,
    }
  })
}
