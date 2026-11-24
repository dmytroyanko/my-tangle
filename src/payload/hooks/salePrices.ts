import type { CollectionBeforeValidateHook, GlobalAfterChangeHook } from 'payload'

// Site prices are not typed in by hand: the admin enters the full price (the recommended retail price) and
// the site price is the full price minus the shop discount (Shop settings, 20% by default), rounded to a
// whole hryvnia. A product may set its own discount instead (0 for no discount), and a colour its own on
// top of that, e.g. where the supplier discounts one design.

type Variant = {
  fullPrice?: number | null
  discountPercent?: number | null
  price?: number | null
  [key: string]: unknown
}
type ProductPrices = {
  fullPrice?: number | null
  discountPercent?: number | null
  price?: number | null
  variants?: Variant[] | null
}

// Multiplied before dividing: 325 × (1 − 0.3) is 227.4999… in floating point, 325 × 70 / 100 is 227.5.
export const salePrice = (fullPrice: number, discountPercent: number) =>
  Math.round((fullPrice * (100 - discountPercent)) / 100)

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
      price: salePrice(variant.fullPrice ?? fullPrice, variant.discountPercent ?? discount),
    }))
  }
  return data
}

// A new shop discount reprices every product. Saving a product runs computeSalePrices with the new value.
// Only products whose latest save is published are saved here: Payload updates from the latest version, so
// saving a product with a pending draft would publish the draft or unpublish the product. A draft gets the
// new prices when it is published.
// A product that cannot be saved is logged and skipped, so one bad product does not undo the settings.
export const repriceProducts: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (doc.discountPercent === previousDoc?.discountPercent) return doc

  const { docs } = await req.payload.find({
    collection: 'products',
    where: { _status: { equals: 'published' }, fullPrice: { exists: true } },
    // The latest version of each product, so `_status` tells whether a draft is pending.
    draft: true,
    depth: 0,
    pagination: false,
    select: { discountPercent: true },
    req,
  })
  for (const product of docs) {
    // A product with its own discount keeps its prices.
    if (typeof product.discountPercent === 'number') continue
    try {
      await req.payload.update({ collection: 'products', id: product.id, data: {}, req })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: `Repricing product ${product.id} failed` })
    }
  }
  return doc
}
