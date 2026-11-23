import { ChevronDownIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { cn } from '@/shared/lib/utils'
import { RichText, richTextClassName } from '@/shared/ui/rich-text'

import type { CategoryData } from '../api/toCategoryData'

// Frequently asked questions of a category as native <details>: answers are always in the HTML and open
// without JavaScript.
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
      <div className="mt-4 divide-y divide-border border-y border-border">
        {faq.map((item, i) => (
          <details key={`${i}-${item.question}`} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <ChevronDownIcon
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <RichText
              data={item.answer}
              headingTag="h4"
              className={cn('pb-5', richTextClassName)}
            />
          </details>
        ))}
      </div>
    </section>
  )
}
