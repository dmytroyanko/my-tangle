import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Category } from '@/payload/payload-types'
import { toCategoryData } from '@/entities/category/@x/product'
import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'
import { toPlainText } from '@/shared/lib/plain-text'

import { specKeys, type ProductSpec } from '../model/specKeys'
import { toSeries } from './toCardData'

// A published product (one colour) in the given locale, looked up by slug, also by another language's slug
// as `otherLocales` says (see findBySlug), with the other colours of its series for the palette. Description
// and characteristics are the product's own, else its category's. A product without a price is not ready to
// sell and has no page. Cached per request, so the page and its metadata share one query.
export const getProductBySlug = cache(
  async (slug: string, locale: Locale, otherLocales: boolean | 'only' = true) => {
    const found = await findBySlug({
      collection: 'products',
      slug,
      locale,
      where: { _status: { equals: 'published' } },
      otherLocales,
    })
    if (!found) return null
    const { doc: product, slugs } = found
    const category = product.category
    if (!category || typeof category !== 'object') return null

    const payload = await getPayload({ config })
    const { docs: siblings } = await payload.find({
      collection: 'products',
      where: { category: { equals: category.id }, _status: { equals: 'published' } },
      sort: ['order', 'createdAt'],
      locale,
      depth: 1,
      pagination: false,
      populate: { categories: { slug: true } },
    })
    const series = toSeries(category, siblings)
    const variantIndex = series?.variants.findIndex((variant) => variant.id === product.id) ?? -1
    if (!series || variantIndex < 0) return null

    const info = (category as Category).productInfo
    const description = product.description ?? info?.description ?? null
    const specs = product.specs?.length ? product.specs : (info?.specs ?? [])

    return {
      id: product.id,
      title: product.title,
      colorName: product.colorName ?? '',
      // The name with the colour: the page title and heading.
      name: [product.title, product.colorName].filter(Boolean).join(' '),
      series,
      variantIndex,
      category: toCategoryData(category, { [locale]: category.slug }),
      description,
      // The same text as plain text, for structured data.
      descriptionText: description ? toPlainText(description) : null,
      // In the fixed order of specKeys, whatever order they were added in, so every product reads the same.
      specs: specs
        .map((spec): ProductSpec => ({ key: spec.key, value: spec.value }))
        .sort((a, b) => specKeys.indexOf(a.key) - specKeys.indexOf(b.key)),
      meta: { title: product.meta?.title ?? null, description: product.meta?.description ?? null },
      slugs,
    }
  },
)

export type ProductDetailsData = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>
