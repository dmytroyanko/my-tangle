import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { cache } from 'react'

import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'

import { specKeys, type ProductSpec } from '../model/specKeys'
import { toCardData } from './toCardData'

// A published product of the given category in the given locale, looked up by slug with the Ukrainian
// fallback (see findBySlug). A product without colours is not ready to sell and has no page.
// Cached per request, so the page and its metadata share one query.
export const getProductBySlug = cache(async (slug: string, categoryId: number, locale: Locale) => {
  const found = await findBySlug({
    collection: 'products',
    slug,
    locale,
    where: { category: { equals: categoryId }, _status: { equals: 'published' } },
  })
  if (!found?.doc.variants?.length) return null
  const { doc: product, slugs } = found

  return {
    ...toCardData(product),
    description: product.description ?? null,
    // The same text as plain text, for structured data.
    descriptionText: product.description
      ? convertLexicalToPlaintext({ data: product.description }).replace(/\s+/g, ' ').trim()
      : null,
    // In the fixed order of specKeys, whatever order they were added in, so every product reads the same.
    specs: (product.specs ?? [])
      .map((spec): ProductSpec => ({ key: spec.key, value: spec.value }))
      .sort((a, b) => specKeys.indexOf(a.key) - specKeys.indexOf(b.key)),
    meta: { title: product.meta?.title ?? null, description: product.meta?.description ?? null },
    slugs,
  }
})

export type ProductDetailsData = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>
