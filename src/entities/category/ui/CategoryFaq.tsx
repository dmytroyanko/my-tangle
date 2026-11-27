import { getTranslations } from 'next-intl/server'

import { FaqSection } from '@/shared/ui/faq-section'

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
  return <FaqSection title={t('title')} items={faq} id="faq-title" className={className} />
}
