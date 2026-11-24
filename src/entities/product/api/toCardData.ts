import type { Product } from '@/payload/payload-types'
import { toImage, type ImageData } from '@/shared/lib/media'

import type { ProductCardData } from '../model/types'
import { variantPrice } from '../model/variantPrice'

// A Payload product (depth 1) reduced to what cards and the product page show. A colour without a price
// (the product has no full price yet) is left out, so it cannot be bought for 0.
export function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    series: product.series ?? null,
    tags: product.tags ?? [],
    variants: (product.variants ?? []).flatMap((variant, index) => {
      const price = variantPrice(variant, product)
      if (price === null) return []
      return {
        id: variant.id ?? String(index),
        name: variant.name,
        color: variant.color ?? null,
        price,
        fullPrice: variant.fullPrice ?? product.fullPrice ?? null,
        inStock: variant.inStock ?? true,
        images: (variant.images ?? [])
          .map(toImage)
          .filter((image): image is ImageData => image !== null),
      }
    }),
  }
}
