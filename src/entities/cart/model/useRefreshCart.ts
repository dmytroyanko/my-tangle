'use client'

import { useCallback, useEffect } from 'react'

import { getCartLines } from '../api/getCartLines'
import { cartActions, useCart } from './store'

// Re-reads the cart lines from the server (current price, stock, names in the page language) while
// `active`, and whenever a colour is added or removed. Returns a function that does it on demand, e.g.
// after the server reported the cart changed. Offline or on a server error the saved copy stays.
export function useRefreshCart(active: boolean, locale: string) {
  const { lines } = useCart()
  // Which lines to check: changes when a colour is added or removed, not when a quantity changes.
  const key = lines.map((line) => line.variantId).join(',')

  const refresh = useCallback(async () => {
    const items = key
      ? key.split(',').map((variantId) => {
          const line = lines.find((item) => item.variantId === variantId)!
          return { productId: line.productId, variantId }
        })
      : []
    if (!items.length) return
    const data = await getCartLines(items, locale)
    cartActions.refresh(
      new Map(data.map(({ productId: _, variantId, ...view }) => [variantId, view])),
    )
    // `lines` is read for the ids only; `key` stands for them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale])

  useEffect(() => {
    if (active) refresh().catch(() => {})
  }, [active, refresh])

  return refresh
}
