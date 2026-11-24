'use client'

import { createContext, useContext } from 'react'

import type { ProductCardData, ProductVariant } from './types'

// The colour picked on a product card or page, for the buy button a feature puts into it (the card and the
// page render the button but do not know the cart).
export type SelectedVariant = {
  product: ProductCardData
  variant: ProductVariant
  // Product page path without the locale, with the picked colour.
  href: string
}

export const SelectedVariantContext = createContext<SelectedVariant | null>(null)

export function useSelectedVariant(): SelectedVariant {
  const selected = useContext(SelectedVariantContext)
  if (!selected) throw new Error('useSelectedVariant is used outside a product card or page')
  return selected
}
