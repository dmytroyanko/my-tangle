import type { CartLine } from './types'

const BUNDLE_BRANDS = ['Tangle Teezer', 'Invisibobble']

// Items in the cart, out of stock ones included (the header badge and the panel title agree on it).
export const cartItemCount = (lines: CartLine[]) =>
  lines.reduce((sum, line) => sum + line.quantity, 0)

// Sums of the lines that can be bought (colours in stock), in UAH. `saleDiscount` is what the site prices
// save against the full prices (e.g. Black Friday −20%); `bundleDiscount` is the bundle offer on top, when
// it is on (`bundlePercent` from Shop settings, null when off) and the cart has both brands.
export function cartTotals(lines: CartLine[], bundlePercent: number | null) {
  const buyable = lines.filter((line) => line.view.inStock)
  const count = buyable.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = buyable.reduce((sum, line) => sum + line.view.price * line.quantity, 0)
  const fullTotal = buyable.reduce(
    (sum, line) => sum + Math.max(line.view.fullPrice ?? 0, line.view.price) * line.quantity,
    0,
  )
  const bundle =
    bundlePercent !== null &&
    BUNDLE_BRANDS.every((brand) => buyable.some((line) => line.view.brand === brand))
  const bundleDiscount = bundle ? Math.round((subtotal * bundlePercent) / 100) : 0

  return {
    count,
    fullTotal,
    saleDiscount: fullTotal - subtotal,
    bundle,
    bundleDiscount,
    total: subtotal - bundleDiscount,
  }
}
