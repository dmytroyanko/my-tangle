import type { Category, Product } from '@/payload/payload-types'
import { toImage, type ImageData } from '@/shared/lib/media'

import { productPrice } from '../model/productPrice'
import type { ProductCardData, ProductVariant } from '../model/types'

// A Payload product (one colour) as a colour of a series card; null without a price, so it cannot be bought
// for 0.
export function toVariant(product: Product): ProductVariant | null {
  const price = productPrice(product)
  if (price === null || !product.slug) return null
  return {
    id: product.id,
    slug: product.slug,
    name: product.colorName ?? '',
    color: product.color ?? null,
    price,
    fullPrice: product.fullPrice ?? null,
    inStock: product.inStock ?? true,
    images: (product.images ?? [])
      .map(toImage)
      .filter((image): image is ImageData => image !== null),
  }
}

// The products of one category (in their admin order) as one series card. The series' tags come from the
// category, unless the first product has its own.
export function toSeries(
  category: Pick<Category, 'id' | 'slug' | 'seriesName' | 'productInfo'>,
  products: Product[],
): ProductCardData | null {
  const variants = products.map(toVariant).filter((variant) => variant !== null)
  const first = products[0]
  if (!first || !variants.length) return null
  return {
    id: category.id,
    slug: category.slug,
    title: first.title,
    series: category.seriesName ?? null,
    tags: first.tags?.length ? first.tags : (category.productInfo?.tags ?? []),
    variants,
  }
}
