'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { colorKey, variantPrice } from '@/entities/product/@x/cart'
import { brands, type BrandKey } from '@/shared/config'
import { routing, type Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'

import type { CartLineData } from '../model/types'

const MAX_LINES = 100

// Current data for the lines of a cart: title, photo, price and stock in the given language. A line whose
// product is gone, unpublished or no longer has that colour (or a price) is left out. The browser's copy is
// never trusted for prices.
export async function getCartLines(
  items: { productId: number; variantId: string }[],
  locale: string,
): Promise<CartLineData[]> {
  const lang = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale
  // A public endpoint: at most MAX_LINES distinct, well-formed lines, whatever the browser sends.
  const seen = new Set<string>()
  const lines = (Array.isArray(items) ? items : [])
    .filter((item) => {
      const valid =
        Number.isInteger(item?.productId) &&
        typeof item?.variantId === 'string' &&
        !seen.has(item.variantId)
      if (valid) seen.add(item.variantId)
      return valid
    })
    .slice(0, MAX_LINES)
  const ids = [...new Set(lines.map((item) => item.productId))]
  if (!ids.length) return []

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { id: { in: ids }, _status: { equals: 'published' } },
    locale: lang,
    depth: 1,
    pagination: false,
    populate: { categories: { slug: true, brand: true } },
  })

  return lines.flatMap((item) => {
    const product = docs.find((doc) => doc.id === item.productId)
    const variant = product?.variants?.find((row) => row.id === item.variantId)
    const category = product?.category
    if (!product || !variant || !category || typeof category === 'number') return []
    const price = variantPrice(variant, product)
    if (price === null) return []
    const brand = (category.brand ?? 'tangle-teezer') as BrandKey

    return {
      productId: product.id,
      variantId: item.variantId,
      title: product.title,
      variantName: variant.name,
      image: toImage(variant.images?.[0]),
      price,
      fullPrice: variant.fullPrice ?? product.fullPrice ?? null,
      href: `/${category.slug}/${product.slug}?color=${colorKey(variant.name)}`,
      inStock: variant.inStock ?? true,
      brand: brands[brand],
    }
  })
}
