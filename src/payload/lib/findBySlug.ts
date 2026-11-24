import config from '@payload-config'
import { getPayload, type JoinQuery, type Where } from 'payload'

import { routing, type Locale } from '@/shared/i18n'

type SluggedCollection = 'categories' | 'products' | 'pages'

// A document by its slug in the given locale, for entity `api` functions. Payload matches slugs only in
// the stored locale, so a lookup in another language falls back to the Ukrainian slug (the page then
// redirects to the slug of its own language, when there is one). Also returns the slug of every language
// version, for hreflang links; a locale without its own slug is left out.
export async function findBySlug<C extends SluggedCollection>({
  collection,
  slug,
  locale,
  where,
  // 2, so documents linked from rich text come with their own relations (a product link needs its
  // category's slug).
  depth = 2,
}: {
  collection: C
  slug: string
  locale: Locale
  // Extra conditions, e.g. the category of a product or the published status.
  where?: Where
  depth?: number
}) {
  const payload = await getPayload({ config })
  // `false` turns every join off; the cast is needed because C is generic here.
  const noJoins = false as JoinQuery<C>
  const find = (slugLocale: Locale) =>
    payload.find({
      collection,
      where: { and: [{ slug: { equals: slug } }, ...(where ? [where] : [])] },
      locale: slugLocale,
      limit: 1,
      depth,
      // Join fields (a category's products) are not read by the site and would load every product.
      joins: noJoins,
    })

  let doc = (await find(locale)).docs[0]
  if (!doc && locale !== routing.defaultLocale) {
    const fallback = (await find(routing.defaultLocale)).docs[0]
    if (fallback)
      doc = await payload.findByID({ collection, id: fallback.id, locale, depth, joins: noJoins })
  }
  if (!doc) return null

  const all = await payload.findByID({
    collection,
    id: doc.id,
    locale: 'all',
    depth: 0,
    select: { slug: true },
  })
  const slugs = Object.fromEntries(
    Object.entries(
      ((all as { slug?: unknown }).slug ?? {}) as Record<string, string | null>,
    ).filter(([, value]) => Boolean(value)),
  ) as Partial<Record<Locale, string>>

  return { doc, slugs }
}
