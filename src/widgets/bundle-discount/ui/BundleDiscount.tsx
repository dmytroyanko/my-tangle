import { getTranslations } from 'next-intl/server'

import { getBundleDiscount } from '@/entities/cart'

// Bundle offer: discount for ordering Tangle Teezer brushes together with Invisibobble hair ties. Hidden
// while the offer is off in Shop settings.
export async function BundleDiscount({ className }: { className?: string }) {
  // No banner when the settings cannot be read, as in the layout: the page still renders.
  const percent = await getBundleDiscount().catch(() => null)
  if (percent === null) return null
  const t = await getTranslations('BundleDiscount')

  return (
    <aside aria-label={t('label')} className={className}>
      <div className="container">
        <div className="flex items-center gap-4 rounded-xl bg-warm px-4 py-3 text-warm-foreground sm:gap-5 sm:px-5 sm:py-4 md:px-8 md:py-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-dark text-base font-bold text-dark-foreground md:size-14 md:text-lg"
            aria-hidden="true"
          >
            {t('badge', { percent })}
          </span>
          <p className="text-sm sm:text-base">
            {/* The badge is decorative, so the discount is spelled out for screen readers and search engines. */}
            {t.rich('text', {
              percent,
              b: (chunks) => <strong className="font-semibold">{chunks}</strong>,
              sr: (chunks) => <span className="sr-only">{chunks}</span>,
            })}
          </p>
        </div>
      </div>
    </aside>
  )
}
