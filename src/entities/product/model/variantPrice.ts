// A colour's site price: its own, else the product's. A colour without one cannot be bought, and a product
// without a priced colour has no page; the product page and the sitemap share this rule.
export const variantPrice = (
  variant: { price?: number | null },
  product: { price?: number | null },
): number | null => {
  const price = variant.price ?? product.price
  return typeof price === 'number' ? price : null
}
