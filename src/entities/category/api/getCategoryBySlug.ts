import { cache } from 'react'

import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

// Category texts in the given locale, looked up by slug with the Ukrainian fallback (see findBySlug).
// Cached per request, so a page and its metadata share one query.
export const getCategoryBySlug = cache(async (slug: string, locale: Locale) => {
  const found = await findBySlug({ collection: 'categories', slug, locale })
  if (!found) return null
  const { doc: category, slugs } = found

  return {
    id: category.id,
    title: category.title,
    heading: category.heading || category.title,
    subtitle: category.subtitle ?? null,
    description: category.description ?? null,
    faq: (category.faq ?? []).map((item) => ({ question: item.question, answer: item.answer })),
    benefits: (category.benefits ?? []).map((item) => ({
      icon: item.icon,
      title: item.title,
      text: item.text ?? null,
    })),
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
