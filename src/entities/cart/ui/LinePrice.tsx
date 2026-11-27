import { useTranslations } from 'next-intl'

import type { CartLine } from '../model/types'

// The price of a cart line for its quantity, with the full price crossed out when it is higher.
export function LinePrice({ line }: { line: CartLine }) {
  const t = useTranslations('Cart')
  const { price, fullPrice } = line.view
  return (
    <p className="text-right text-sm leading-tight">
      {fullPrice !== null && fullPrice > price && (
        <s className="block text-xs text-muted-foreground">
          <span className="sr-only">{t('oldPrice')} </span>
          {t('price', { price: fullPrice * line.quantity })}
        </s>
      )}
      <span className="font-semibold">{t('price', { price: price * line.quantity })}</span>
    </p>
  )
}
