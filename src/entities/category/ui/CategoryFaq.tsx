import { getTranslations } from 'next-intl/server'

import { FaqList } from '@/shared/ui/faq-list'

import type { CategoryData } from '../api/toCategoryData'

// Frequently asked questions of a category under one heading.
export async function CategoryFaq({
  faq,
  className,
}: {
  faq: CategoryData['faq']
  className?: string
}) {
  if (!faq.length) return null
  const t = await getTranslations('CategoryFaq')

  return (
    <section aria-labelledby="faq-title" className={className}>
      <h2 id="faq-title" className="text-xl md:text-2xl">
        {t('title')}
      </h2>
      <FaqList items={faq} className="mt-4" />
    </section>
  )
}
