import type { ImageData } from '@/shared/lib/media'

export type ProductVariant = {
  id: string
  name: string
  // Swatch colour, #rrggbb.
  color: string | null
  price: number
  // Price before the discount, shown crossed out.
  fullPrice: number | null
  inStock: boolean
  images: ImageData[]
}

// A product as shown on a card: one series (e.g. "Matte") with its colours.
export type ProductCardData = {
  id: number
  slug: string
  title: string
  series: string | null
  tags: string[]
  variants: ProductVariant[]
}
