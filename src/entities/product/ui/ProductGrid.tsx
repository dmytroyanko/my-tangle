import { cn } from '@/shared/lib/utils'

import { seriesKey } from '../model/seriesKey'
import type { ProductCardData } from '../model/types'
import { ProductCard } from './ProductCard'

// Series cards: large (photo, palette, button), so 2 columns, 3 from md. Each item is a size container
// for the card, an anchor target (#product-slug) and carries its series key for the series filter. `eager` loads the photos of the
// first cards at high priority, for a grid at the top of the page (its first row is the LCP).
type Props = {
  products: ProductCardData[]
  // Category path without the locale (/the-ultimate-detangler); a card links to basePath/product-slug.
  basePath: string
  eager?: number
  className?: string
}

export function ProductGrid({ products, basePath, eager = 0, className }: Props) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-10',
        className,
      )}
    >
      {products.map((product, index) => (
        <li
          key={product.id}
          id={product.slug}
          data-series={seriesKey(product)}
          className="@container scroll-mt-6"
        >
          <ProductCard
            product={product}
            href={`${basePath}/${product.slug}`}
            priority={index < eager}
          />
        </li>
      ))}
    </ul>
  )
}
