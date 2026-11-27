import type { Category } from '@/payload/payload-types'
import type { BrandKey } from '@/shared/config'
import type { Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

const toFaq = (faq: Category['faq']) =>
  (faq ?? []).map((item) => ({ question: item.question, answer: item.answer }))

// A Payload category (depth 1 or more, one locale) reduced to what category pages and home page blocks show.
// `slugs` holds the slug of each language version that has one, for links and hreflang.
export function toCategoryData(category: Category, slugs: Partial<Record<Locale, string>>) {
  // A subcategory's parent, populated at depth 1 or more; an id alone (depth 0) gives no data to show.
  const parent = category.parent && typeof category.parent === 'object' ? category.parent : null
  return {
    id: category.id,
    title: category.title,
    // Categories saved before the brand field existed are Tangle Teezer.
    brand: (category.brand ?? 'tangle-teezer') as BrandKey,
    heading: category.heading || category.title,
    subtitle: category.subtitle ?? null,
    productView: category.productView ?? 'groups',
    homeProductView: category.homeProductView ?? 'groups',
    description: category.description ?? null,
    // The description of the series this category holds (a subcategory, or a category with one series).
    productDescription: category.productInfo?.description ?? null,
    faq: toFaq(category.faq),
    benefits: (category.benefits ?? []).map((item) => ({
      icon: item.icon,
      title: item.title,
      text: item.text ?? null,
    })),
    image: toImage(category.image),
    slugs,
    // The category a subcategory belongs to, for breadcrumbs and the questions shown on its page.
    parent: parent
      ? { id: parent.id, title: parent.title, slug: parent.slug, faq: toFaq(parent.faq) }
      : null,
    meta: {
      title: category.meta?.title ?? null,
      description: category.meta?.description ?? null,
      image: toImage(category.meta?.image) ?? toImage(category.image),
    },
  }
}

export type CategoryData = ReturnType<typeof toCategoryData>
