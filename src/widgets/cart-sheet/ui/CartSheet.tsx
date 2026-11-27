'use client'

import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

import {
  cartActions,
  cartItemCount,
  cartTotals,
  CartTotals,
  LinePrice,
  MAX_QUANTITY,
  useCart,
  useRefreshCart,
  type CartLine,
} from '@/entities/cart/index.client'
import { routes } from '@/shared/config'
import { Link, type Locale } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/shared/ui/sheet'

// The cart as a side panel: opens after "Buy" and from the header icon. When it opens, the lines are
// checked on the server, so prices and stock are current; a colour out of stock stays in the cart, muted
// and left out of the total. `bundlePercent` is the bundle discount from Shop settings, null while it is off.
export function CartSheet({ bundlePercent }: { bundlePercent: number | null }) {
  const t = useTranslations('Cart')
  const locale = useLocale() as Locale
  const { lines, open } = useCart()
  const totals = cartTotals(lines, bundlePercent)
  const itemCount = cartItemCount(lines)
  const close = () => cartActions.setOpen(false)
  useRefreshCart(open, locale)

  return (
    <Sheet open={open} onOpenChange={cartActions.setOpen}>
      <SheetContent closeLabel={t('close')} className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-lg">
            {t('title')}
            {itemCount > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {t('items', { count: itemCount })}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
            <p className="text-base text-muted-foreground">{t('empty')}</p>
            <Button asChild className="rounded-full px-6" onClick={close}>
              <Link href="/#catalog">{t('toCatalog')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {lines.map((line) => (
                <CartLineItem key={line.productId} line={line} onNavigate={close} />
              ))}
            </ul>

            <SheetFooter className="gap-3 border-t border-border px-5 py-4">
              {bundlePercent !== null && !totals.bundle && (
                <p className="rounded-lg bg-warm px-3 py-2 text-sm text-warm-foreground">
                  {t('bundleHint', { percent: bundlePercent })}
                </p>
              )}
              <CartTotals totals={totals} bundlePercent={bundlePercent} />
              <Button
                asChild={totals.count > 0}
                disabled={totals.count === 0}
                size="lg"
                className="h-12 w-full rounded-full text-sm font-semibold tracking-[0.1em] uppercase"
                onClick={close}
              >
                {totals.count > 0 ? (
                  <Link href={routes.checkout[locale]}>{t('checkout')}</Link>
                ) : (
                  t('checkout')
                )}
              </Button>
              <Button variant="ghost" className="w-full rounded-full" onClick={close}>
                {t('continue')}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate: () => void }) {
  const t = useTranslations('Cart')
  const { view } = line
  const name = `${view.title} ${view.variantName}`

  return (
    <li className={cn('flex gap-4 py-4', !view.inStock && 'opacity-60')}>
      <Link
        href={view.href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-white"
      >
        {view.image && (
          <Image
            src={view.image.url}
            alt=""
            fill
            sizes="80px"
            className={cn('object-contain', !view.inStock && 'grayscale')}
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={view.href}
          onClick={onNavigate}
          className="text-sm leading-snug font-semibold hover:underline"
        >
          {view.title}
        </Link>
        <p className="text-xs text-muted-foreground">{view.variantName}</p>
        {view.inStock ? (
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center rounded-full border border-border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={line.quantity <= 1}
                onClick={() => cartActions.setQuantity(line.productId, line.quantity - 1)}
                aria-label={t('decrease', { name })}
              >
                <MinusIcon className="size-3.5" />
              </Button>
              <span className="min-w-6 text-center text-sm tabular-nums" aria-label={t('quantity')}>
                {line.quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={line.quantity >= MAX_QUANTITY}
                onClick={() => cartActions.setQuantity(line.productId, line.quantity + 1)}
                aria-label={t('increase', { name })}
              >
                <PlusIcon className="size-3.5" />
              </Button>
            </div>
            <LinePrice line={line} />
          </div>
        ) : (
          <p className="mt-auto text-sm font-semibold text-muted-foreground">{t('outOfStock')}</p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-mr-2 size-8 shrink-0 text-muted-foreground"
        onClick={() => cartActions.remove(line.productId)}
        aria-label={t('remove', { name })}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </li>
  )
}
