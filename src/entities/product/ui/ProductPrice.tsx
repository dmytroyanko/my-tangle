import { useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/utils'

type Props = {
  price: number
  // The price before the discount; shown crossed out when it is higher than the price.
  fullPrice: number | null
  size?: 'md' | 'lg'
  className?: string
}

// The site price with the full price crossed out and the discount it comes from.
export function ProductPrice({ price, fullPrice, size = 'md', className }: Props) {
  const t = useTranslations('ProductCard')
  const discounted = fullPrice !== null && fullPrice > price

  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-bold', size === 'lg' ? 'text-3xl' : 'text-lg')}>
        {t('price', { price })}
      </span>
      {discounted && (
        <>
          <s className={cn('text-muted-foreground', size === 'lg' ? 'text-lg' : 'text-sm')}>
            <span className="sr-only">{t('oldPrice')} </span>
            {t('price', { price: fullPrice })}
          </s>
          <span className="rounded-full bg-warm px-2 py-0.5 text-xs font-semibold text-warm-foreground">
            {t('discount', { percent: Math.round((1 - price / fullPrice) * 100) })}
          </span>
        </>
      )}
    </p>
  )
}
