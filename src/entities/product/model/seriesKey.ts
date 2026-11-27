import { toSlug } from '@/shared/lib/slugify'

import type { ProductCardData } from './types'

// Short URL-safe key of a series ("matte", "chrome-mini"), used by the series filter.
export const seriesKey = (series: Pick<ProductCardData, 'series' | 'title'>) =>
  toSlug(series.series ?? series.title)
