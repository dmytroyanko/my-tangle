import { getLocale, getTranslations } from 'next-intl/server'

import { getHomeFaq } from '@/entities/page'
import type { Locale } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { FaqSection } from '@/shared/ui/faq-section'

// Questions under the catalog on the home page, from the admin ("Головна сторінка"); nothing when empty.
// The home page still renders if they cannot be read (e.g. before the migration), but the error is logged.
export async function HomeFaq({ className }: { className?: string }) {
  const locale = (await getLocale()) as Locale
  const faq = await getHomeFaq(locale).catch((error) => {
    console.error('HomeFaq:', error)
    return []
  })
  const t = await getTranslations('HomeFaq')
  return (
    <FaqSection
      title={t('title')}
      items={faq}
      id="home-faq-title"
      className={cn('container', className)}
      headingClassName="text-2xl leading-tight md:text-[1.75rem]"
    />
  )
}
