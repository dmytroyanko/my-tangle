'use client'

import { ShoppingBagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/shared/ui/button'

import { cartActions, useCart } from '../model/store'
import { cartItemCount } from '../model/totals'

// The cart icon in the header: the number of items, and a click opens the cart panel.
export function CartButton({ className }: { className?: string }) {
  const t = useTranslations('Cart')
  const { lines } = useCart()
  const count = cartItemCount(lines)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={() => cartActions.setOpen(true)}
      aria-label={count ? t('openWithCount', { count }) : t('open')}
      className={className}
    >
      <span className="relative">
        <ShoppingBagIcon className="size-5" />
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dark px-1 text-[0.625rem] leading-none font-semibold text-dark-foreground"
            aria-hidden="true"
          >
            {count}
          </span>
        )}
      </span>
    </Button>
  )
}
