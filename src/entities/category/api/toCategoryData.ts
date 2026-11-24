import type { Category } from '@/payload/payload-types'
import type { BrandKey } from '@/shared/config'
import type { Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

// A Payload category (depth 1 or more, one locale) reduced to what category pages and home page blocks show.
// `slugs` holds the slug of each language version that has one, for links and hreflang.
export function toCategoryData(category: Category, slugs: Partial<Record<Locale, string>>) {
  return {
    id: category.id,
    title: category.title,
    // Categories saved before the brand field existed are Tangle Teezer.
    brand: (category.brand ?? 'tangle-teezer') as BrandKey,
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
}

export type CategoryData = ReturnType<typeof toCategoryData>
