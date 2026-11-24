import { getTranslations } from 'next-intl/server'

import { Link } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

// A way back to the catalog at the end of a page without products (contacts, articles).
export async function CatalogCta({ className }: { className?: string }) {
  const t = await getTranslations('CatalogCta')

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 rounded-xl bg-warm px-5 py-6 text-warm-foreground sm:flex-row sm:items-center sm:gap-6 md:px-8',
        className,
      )}
    >
      <p className="text-base font-semibold sm:flex-1">{t('text')}</p>
      <Button asChild className="rounded-full px-6">
        <Link href="/#catalog">{t('link')}</Link>
      </Button>
    </div>
  )
}
