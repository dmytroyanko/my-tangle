import type { ProductVariant } from './types'

// The colour a product opens with: the first one in stock, or the first one when none is. Cards link to it
// without ?color=, so the card and the product page must agree on it.
export const defaultVariantIndex = (variants: ProductVariant[]) =>
  Math.max(
    variants.findIndex((variant) => variant.inStock),
    0,
  )

// A product with a palette. Without swatch colours (a spray in one size) there is no colour to pick, so the
// palette and the colour line are left out.
export const hasPalette = (variants: ProductVariant[]) => variants.some((variant) => variant.color)
