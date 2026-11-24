// Brands the shop sells. A category names its brand (Payload: Categories → brand); the brand's country is
// UI text in messages (ProductSpecs.countries).
export const brands = {
  'tangle-teezer': 'Tangle Teezer',
  invisibobble: 'Invisibobble',
} as const

export type BrandKey = keyof typeof brands

// The product's full name with its brand, e.g. "Tangle Teezer The Ultimate Styler". Titles that already
// start with the brand ("Invisibobble Clipstar") are kept as they are.
export const withBrand = (brand: BrandKey, title: string) =>
  title.startsWith(brands[brand]) ? title : `${brands[brand]} ${title}`
