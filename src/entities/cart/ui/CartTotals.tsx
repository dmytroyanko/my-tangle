import { useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/utils'

import type { cartTotals } from '../model/totals'

type Props = {
  totals: ReturnType<typeof cartTotals>
  // The bundle discount from Shop settings, null while it is off.
  bundlePercent: number | null
  className?: string
}

// The sums of the cart panel and the checkout summary: the full total and the discounts when there are any,
// then the total to pay.
export function CartTotals({ totals, bundlePercent, className }: Props) {
  const t = useTranslations('Cart')
  return (
    <dl className={cn('space-y-1 text-sm', className)}>
      {(totals.saleDiscount > 0 || totals.bundleDiscount > 0) && (
        <div className="flex justify-between text-muted-foreground">
          <dt>{t('fullTotal')}</dt>
          <dd>{t('price', { price: totals.fullTotal })}</dd>
        </div>
      )}
      {totals.saleDiscount > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <dt>{t('saleDiscount')}</dt>
          <dd>−{t('price', { price: totals.saleDiscount })}</dd>
        </div>
      )}
      {totals.bundleDiscount > 0 && bundlePercent !== null && (
        <div className="flex justify-between text-muted-foreground">
          <dt>{t('bundleDiscount', { percent: bundlePercent })}</dt>
          <dd>−{t('price', { price: totals.bundleDiscount })}</dd>
        </div>
      )}
      <div className="flex justify-between text-base font-semibold">
        <dt>{t('total')}</dt>
        <dd>{t('price', { price: totals.total })}</dd>
      </div>
    </dl>
  )
}
