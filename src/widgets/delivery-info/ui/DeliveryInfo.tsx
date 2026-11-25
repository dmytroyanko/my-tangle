import { ChevronDownIcon, CreditCardIcon, TruckIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

const strong = (chunks: ReactNode) => (
  <strong className="font-semibold text-foreground">{chunks}</strong>
)

// Delivery and payment terms, collapsed by default. A native <details>: the text is always in the HTML
// for search engines and opens without JavaScript.
export async function DeliveryInfo({ className }: { className?: string }) {
  const t = await getTranslations('DeliveryInfo')

  return (
    <details className={cn('group rounded-xl border border-border', className)}>
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 md:px-6 [&::-webkit-details-marker]:hidden">
        <TruckIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="flex-1">
          {/* A heading inside <summary> is allowed; it puts the block in the page outline. */}
          <h2 className="text-base font-semibold">{t('title')}</h2>
          <span className="block text-xs text-muted-foreground">{t('hint')}</span>
        </div>
        <ChevronDownIcon
          className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="grid gap-6 border-t border-border px-5 py-5 md:grid-cols-2 md:px-6">
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <TruckIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {t('deliveryTitle')}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
            <li>{t.rich('novaPoshta', { b: strong })}</li>
            <li>{t('shipping')}</li>
          </ul>
        </section>
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CreditCardIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {t('paymentTitle')}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
            <li>{t.rich('wallet', { b: strong })}</li>
            <li>{t.rich('card', { b: strong })}</li>
            <li>{t.rich('cashOnDelivery', { b: strong })}</li>
          </ul>
        </section>
      </div>
    </details>
  )
}
