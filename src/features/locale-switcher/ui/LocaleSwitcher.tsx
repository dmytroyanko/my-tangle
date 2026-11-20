'use client'

import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/utils'
import { Link, routing, usePathname } from '@/shared/i18n'

const labels = { uk: 'UA', ru: 'RU' } as const

// Links to the same page in each language. Plain links (not a select) so crawlers can follow them.
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t('label')} className={cn('flex items-center gap-1', className)}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground" aria-hidden="true">/</span>}
          <Link
            href={pathname}
            locale={l}
            hrefLang={l}
            aria-current={l === locale ? 'true' : undefined}
            className={cn(
              'rounded px-1 font-semibold transition-colors',
              l === locale ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {labels[l]}
          </Link>
        </span>
      ))}
    </nav>
  )
}
