import type { Product } from '@/payload/payload-types'
import { toImage, type ImageData } from '@/shared/lib/media'

import type { ProductCardData } from '../model/types'

// A Payload product (depth 1) reduced to what cards and the product page show.
export function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    series: product.series ?? null,
    tags: product.tags ?? [],
    variants: (product.variants ?? []).map((variant, index) => ({
      id: variant.id ?? String(index),
      name: variant.name,
      color: variant.color ?? null,
      price: variant.price ?? product.price,
      inStock: variant.inStock ?? true,
      images: (variant.images ?? [])
        .map(toImage)
        .filter((image): image is ImageData => image !== null),
    })),
  }
}
