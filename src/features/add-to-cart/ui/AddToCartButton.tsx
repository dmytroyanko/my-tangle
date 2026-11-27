'use client'

import { useTranslations } from 'next-intl'

import { cartActions } from '@/entities/cart/index.client'
import { useSelectedVariant } from '@/entities/product/index.client'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

// Adds the colour picked on the card, or the product of the page, to the cart, which then opens. `size`
// follows the place: a compact button on cards, a large one on the product page.
export function AddToCartButton({ size = 'card' }: { size?: 'card' | 'page' }) {
  const t = useTranslations('ProductCard')
  const { product, variant } = useSelectedVariant()

  const add = () =>
    cartActions.add({
      productId: variant.id,
      view: {
        title: product.title,
        variantName: variant.name,
        image: variant.images[0] ?? null,
        price: variant.price,
        fullPrice: variant.fullPrice,
        href: `/${variant.slug}`,
        inStock: variant.inStock,
      },
    })

  return (
    <Button
      type="button"
      size={size === 'page' ? 'lg' : 'default'}
      onClick={add}
      className={cn(
        'rounded-full',
        size === 'page'
          ? 'h-12 w-full px-10 text-sm font-semibold tracking-[0.1em] uppercase sm:w-auto'
          : 'w-full px-6 @2xs:w-auto',
      )}
    >
      {t('buy')}
    </Button>
  )
}
