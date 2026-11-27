// A product's site price. A product without one (no full price yet) cannot be bought and has no page; the
// pages, the cart and the sitemap share this rule.
export const productPrice = (product: { price?: number | null }): number | null =>
  typeof product.price === 'number' ? product.price : null
