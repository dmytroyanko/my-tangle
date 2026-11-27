import type { ImageData } from '@/shared/lib/media'

// One colour: a product with its own page.
export type ProductVariant = {
  // The product's id.
  id: number
  // The product's slug in the current language; its page is /<slug>.
  slug: string
  // Colour (or size) name, e.g. "Black Gloss".
  name: string
  // Swatch colour, #rrggbb.
  color: string | null
  price: number
  // Price before the discount, shown crossed out.
  fullPrice: number | null
  inStock: boolean
  images: ImageData[]
}

// A series as shown on a card: the colours of one category (a subcategory, or a category with a single
// series), e.g. "The Ultimate Detangler Large" with its colours.
export type ProductCardData = {
  // The id and slug of the category that holds the series.
  id: number
  slug: string
  // The product name without a colour.
  title: string
  // Short series name for the badge and the series filter ("Large"); null in a category with one series.
  series: string | null
  tags: string[]
  variants: ProductVariant[]
}
