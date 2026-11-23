import type { CollectionBeforeValidateHook, GlobalAfterChangeHook } from 'payload'

// Site prices are not typed in by hand: the admin enters the full price (the supplier's price minus 1 UAH)
// and the site price is the full price minus the shop discount (Shop settings, 20% by default), rounded to
// a whole hryvnia. A product may set its own discount instead.

type Variant = { fullPrice?: number | null; price?: number | null; [key: string]: unknown }
type ProductPrices = {
  fullPrice?: number | null
  discountPercent?: number | null
  price?: number | null
  variants?: Variant[] | null
}

export const salePrice = (fullPrice: number, discountPercent: number) =>
  Math.round(fullPrice * (1 - discountPercent / 100))

// A field the update did not send keeps its saved value; a field sent as null was cleared on purpose.
const pick = <K extends keyof ProductPrices>(
  data: ProductPrices,
  saved: ProductPrices | undefined,
  key: K,
): ProductPrices[K] => (key in data ? data[key] : saved?.[key])

export const computeSalePrices: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const product = data as ProductPrices
  const saved = originalDoc as ProductPrices | undefined

  const fullPrice = pick(product, saved, 'fullPrice')
  if (typeof fullPrice !== 'number') return data

  const own = pick(product, saved, 'discountPercent')
  const discount =
    typeof own === 'number'
      ? own
      : (await req.payload.findGlobal({ slug: 'shop-settings', depth: 0, req })).discountPercent

  product.price = salePrice(fullPrice, discount)
  const variants = pick(product, saved, 'variants')
  if (variants) {
    product.variants = variants.map((variant) => ({
      ...variant,
      price: salePrice(variant.fullPrice ?? fullPrice, discount),
    }))
  }
  return data
}

// A new shop discount reprices every product. Saving a product runs computeSalePrices with the new value.
export const repriceProducts: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.discountPercent === previousDoc?.discountPercent) return doc

  const { docs } = await req.payload.find({
    collection: 'products',
    depth: 0,
    pagination: false,
    select: { discountPercent: true },
    req,
  })
  for (const product of docs) {
    // A product with its own discount keeps its prices.
    if (typeof product.discountPercent === 'number') continue
    await req.payload.update({ collection: 'products', id: product.id, data: {}, req })
  }
  return doc
}
