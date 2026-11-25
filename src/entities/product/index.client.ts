// The part of the public API that client components may import: no Payload queries, so it does not pull the
// server code into the browser bundle.
export { useSelectedVariant, type SelectedVariant } from './model/selectedVariant'
export type { ProductCardData } from './model/types'
export { ProductGrid, type ProductListView } from './ui/ProductGrid'
