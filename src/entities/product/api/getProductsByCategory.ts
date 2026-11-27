import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/shared/i18n'

import type { ProductCardData } from '../model/types'
import { toSeries } from './toCardData'

// The series of a category with their colours: its own products as one series, then a series per
// subcategory, in their admin order. Series with no colour in stock go last, so cards that can be bought
// come first. Cached per request.
export const getProductsByCategory = cache(
  async (categoryId: number, locale: Locale): Promise<ProductCardData[]> => {
    const payload = await getPayload({ config })
    const select = { slug: true, seriesName: true, productInfo: { tags: true } } as const
    const [{ docs: children }, self] = await Promise.all([
      payload.find({
        collection: 'categories',
        where: { parent: { equals: categoryId } },
        // Categories added in the admin default to order 0; creation date keeps their order stable.
        sort: ['order', 'createdAt'],
        locale,
        depth: 0,
        joins: false,
        pagination: false,
        select,
      }),
      // null instead of an error when the category was deleted meanwhile: the page then lists nothing.
      payload.findByID({
        collection: 'categories',
        id: categoryId,
        locale,
        depth: 0,
        joins: false,
        select,
        disableErrors: true,
      }),
    ])
    if (!self) return []
    const holders = [self, ...children]

    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        category: { in: holders.map((holder) => holder.id) },
        _status: { equals: 'published' },
      },
      sort: ['order', 'createdAt'],
      locale,
      depth: 1,
      pagination: false,
      // The category is known already; only the photos are populated.
      populate: { categories: { slug: true } },
    })
    const categoryOf = (product: (typeof products)[number]) =>
      typeof product.category === 'object' ? product.category?.id : product.category

    const series = holders.flatMap((holder) => {
      const card = toSeries(
        holder,
        products.filter((product) => categoryOf(product) === holder.id),
      )
      return card ? [card] : []
    })
    const inStock = (card: ProductCardData) => card.variants.some((variant) => variant.inStock)
    // Array.sort is stable, so the admin order holds within each group.
    return series.sort((a, b) => Number(inStock(b)) - Number(inStock(a)))
  },
)
