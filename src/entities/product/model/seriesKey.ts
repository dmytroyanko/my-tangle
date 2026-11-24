import { toSlug } from '@/shared/lib/slugify'

import type { ProductCardData } from './types'

// Short URL-safe key of a product's series ("matte", "chrome-mini"), used by the series filter.
export const seriesKey = (product: Pick<ProductCardData, 'series' | 'title'>) =>
  toSlug(product.series ?? product.title)
