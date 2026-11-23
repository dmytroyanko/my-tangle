import type { ProductVariant } from './types'

// The colour a product opens with: the first one in stock, or the first one when none is. Cards link to it
// without ?color=, so the card and the product page must agree on it.
export const defaultVariantIndex = (variants: ProductVariant[]) =>
  Math.max(
    variants.findIndex((variant) => variant.inStock),
    0,
  )
