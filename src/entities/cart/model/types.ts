import type { ImageData } from '@/shared/lib/media'

// What the cart shows for a line until the server confirms it: saved with the line when it is added, so the
// cart opens at once, and replaced by current data (price, stock) from getCartLines.
export type CartLineView = {
  title: string
  variantName: string
  image: ImageData | null
  price: number
  // Price before the discount, shown crossed out.
  fullPrice: number | null
  // Product page path without the locale.
  href: string
  inStock: boolean
  // Brand name, for the bundle discount; known once the server has confirmed the line.
  brand?: string
}

// One product (a colour) in the cart.
export type CartLine = {
  productId: number
  quantity: number
  view: CartLineView
}

// A line as the server sees it.
export type CartLineData = CartLineView & {
  productId: number
  brand: string
}
