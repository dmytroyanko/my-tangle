import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'
import { toImage, type ImageData } from '@/shared/lib/media'

import type { ProductCardData } from '../model/types'

// Published products of a category in their admin order, with colours and photos.
export async function getProductsByCategory(categoryId: number, locale: Locale): Promise<ProductCardData[]> {
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

  return docs.map((product) => ({
    id: product.id,
    title: product.title,
    series: product.series ?? null,
    tags: product.tags ?? [],
    variants: (product.variants ?? []).map((variant, index) => ({
      id: variant.id ?? String(index),
      name: variant.name,
      color: variant.color ?? null,
      price: variant.price ?? product.price,
      inStock: variant.inStock ?? true,
      images: (variant.images ?? []).map(toImage).filter((image): image is ImageData => image !== null),
    })),
  }))
}
