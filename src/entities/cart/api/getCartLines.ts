'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { productPrice } from '@/entities/product/@x/cart'
import { brands, type BrandKey } from '@/shared/config'
import { routing, type Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

import type { CartLineData } from '../model/types'

const MAX_LINES = 100

// Current data for the lines of a cart: title, photo, price and stock in the given language. A line whose
// product is gone, unpublished or has no price is left out. The browser's copy is never trusted for prices.
export async function getCartLines(
  items: { productId: number }[],
  locale: string,
): Promise<CartLineData[]> {
  const lang = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale
  // A public endpoint: at most MAX_LINES distinct, well-formed lines, whatever the browser sends.
  const ids = [
    ...new Set(
      (Array.isArray(items) ? items : [])
        .map((item) => item?.productId)
        .filter((id): id is number => Number.isInteger(id)),
    ),
  ].slice(0, MAX_LINES)
  if (!ids.length) return []

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { id: { in: ids }, _status: { equals: 'published' } },
    locale: lang,
    depth: 1,
    pagination: false,
    populate: { categories: { brand: true } },
  })

  return ids.flatMap((id) => {
    const product = docs.find((doc) => doc.id === id)
    const category = product?.category
    if (!product || !product.slug || !category || typeof category === 'number') return []
    const price = productPrice(product)
    if (price === null) return []
    const brand = (category.brand ?? 'tangle-teezer') as BrandKey

    return {
      productId: product.id,
      title: product.title,
      variantName: product.colorName ?? '',
      image: toImage(product.images?.[0]),
      price,
      fullPrice: product.fullPrice ?? null,
      href: `/${product.slug}`,
      inStock: product.inStock ?? true,
      brand: brands[brand],
    }
  })
}
