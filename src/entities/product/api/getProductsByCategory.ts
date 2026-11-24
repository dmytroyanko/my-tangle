import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/shared/i18n'

import type { ProductCardData } from '../model/types'
import { toCardData } from './toCardData'

// Published products of a category in their admin order, with colours and photos; products with no colour
// in stock go last, so cards that can be bought come first. Cached per request.
export const getProductsByCategory = cache(
  async (categoryId: number, locale: Locale): Promise<ProductCardData[]> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'products',
      where: { category: { equals: categoryId }, _status: { equals: 'published' } },
      // Products added in the admin default to order 0; creation date keeps their order stable.
      sort: ['order', 'createdAt'],
      locale,
      depth: 1,
      pagination: false,
    })

    // A product without colours is not ready to sell (see getProductBySlug).
    const products = docs.map(toCardData).filter((product) => product.variants.length > 0)
    const inStock = (product: ProductCardData) =>
      product.variants.some((variant) => variant.inStock)
    // Array.sort is stable, so the admin order holds within each group.
    return products.sort((a, b) => Number(inStock(b)) - Number(inStock(a)))
  },
)
