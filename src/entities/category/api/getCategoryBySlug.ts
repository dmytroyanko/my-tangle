import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { routing, type Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

// Category texts in the given locale. Payload matches slugs only in the stored locale, so a Russian
// lookup falls back to the Ukrainian slug when the Russian one is not set. Cached per request, so a page
// and its metadata share one query.
export const getCategoryBySlug = cache(async (slug: string, locale: Locale) => {
  const payload = await getPayload({ config })
  const find = (slugLocale: Locale) =>
    payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      locale: slugLocale,
      limit: 1,
      depth: 1,
    })

  let { docs } = await find(locale)
  if (!docs.length && locale !== routing.defaultLocale) {
    const fallback = await find(routing.defaultLocale)
    if (fallback.docs[0]) {
      docs = [await payload.findByID({ collection: 'categories', id: fallback.docs[0].id, locale, depth: 1 })]
    }
  }

  const category = docs[0]
  if (!category) return null

  // Slugs of every language version, for hreflang links.
  const all = await payload.findByID({ collection: 'categories', id: category.id, locale: 'all', depth: 0 })
  const slugs = all.slug as unknown as Partial<Record<Locale, string>>

  return {
    id: category.id,
    title: category.title,
    heading: category.heading || category.title,
    subtitle: category.subtitle ?? null,
    description: category.description ?? null,
    image: toImage(category.image),
    slugs,
    meta: {
      title: category.meta?.title ?? null,
      description: category.meta?.description ?? null,
      image: toImage(category.meta?.image) ?? toImage(category.image),
    },
  }
})

export type CategoryData = NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>
