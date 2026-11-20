import { getTranslations } from 'next-intl/server'

// Bundle offer: discount for ordering Tangle Teezer brushes together with Invisibobble hair ties.
export async function BundleDiscount({ className }: { className?: string }) {
  const t = await getTranslations('BundleDiscount')

  return (
    <aside aria-label={t('label')} className={className}>
      <div className="container">
        <div className="flex items-center gap-4 rounded-xl bg-warm px-4 py-3 text-warm-foreground sm:gap-5 sm:px-5 sm:py-4 md:px-8 md:py-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-dark text-base font-bold text-dark-foreground md:size-14 md:text-lg"
            aria-hidden="true"
          >
            {t('badge')}
          </span>
          <p className="text-sm sm:text-base">
            {/* The badge is decorative, so the discount is spelled out for screen readers and search engines. */}
            {t.rich('text', {
              b: (chunks) => <strong className="font-semibold">{chunks}</strong>,
              sr: (chunks) => <span className="sr-only">{chunks}</span>,
            })}
          </p>
        </div>
      </div>
    </aside>
  )
}
