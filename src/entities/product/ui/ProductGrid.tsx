import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { seriesKey } from '../model/seriesKey'
import type { ProductCardData } from '../model/types'
import { ProductCard } from './ProductCard'

// Product cards: large (photo, palette, button), so 2 columns, 3 from md. `view` "groups" shows a card per
// series with its palette; "grid" a card per colour (for categories with one or two series), colours in
// stock first. Each item is a size container for the card, carries its series key for the series filter,
// and the first card of each product is its anchor target (#product-slug). `eager` loads the photos of the first cards at high
// priority, for a grid at the top of the page (its first row is the LCP).
type Props = {
  products: ProductCardData[]
  // Category path without the locale (/the-ultimate-detangler); a card links to basePath/product-slug.
  basePath: string
  eager?: number
  // The buy button for every card (see ProductCard).
  buy?: ReactNode
  view?: ProductListView
  className?: string
}

export type ProductListView = 'groups' | 'grid'

export function ProductGrid({
  products,
  basePath,
  eager = 0,
  buy,
  view = 'groups',
  className,
}: Props) {
  const cards =
    view === 'grid'
      ? products
          .flatMap((product) =>
            product.variants.map((variant, variantIndex) => ({ product, variant, variantIndex })),
          )
          // A stable sort: colours in stock first, otherwise in the admin's order.
          .sort((a, b) => Number(b.variant.inStock) - Number(a.variant.inStock))
      : products.map((product) => ({ product, variant: null, variantIndex: undefined }))

  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-10',
        className,
      )}
    >
      {cards.map(({ product, variant, variantIndex }, index) => (
        <li
          key={variant ? `${product.id}-${variant.id}` : product.id}
          // The product's anchor (#slug) on its series card, or on its first colour card.
          id={
            !variant || cards.findIndex((card) => card.product.id === product.id) === index
              ? product.slug
              : undefined
          }
          data-series={seriesKey(product)}
          className="@container scroll-mt-6"
        >
          <ProductCard
            product={product}
            href={`${basePath}/${product.slug}`}
            priority={index < eager}
            buy={buy}
            variantIndex={variantIndex}
          />
        </li>
      ))}
    </ul>
  )
}
