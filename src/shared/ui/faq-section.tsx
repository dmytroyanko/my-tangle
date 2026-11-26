import { cn } from '@/shared/lib/utils'

import { FaqList, type FaqItem } from './faq-list'

type Props = {
  title: string
  items: FaqItem[]
  // id of the heading, unique on the page (the section is labelled by it).
  id: string
  className?: string
  headingClassName?: string
}

// Questions and answers under an h2: a category's FAQ, the home page FAQ. Nothing when there are none.
export function FaqSection({ title, items, id, className, headingClassName }: Props) {
  if (!items.length) return null
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className={cn('text-xl md:text-2xl', headingClassName)}>
        {title}
      </h2>
      <FaqList items={items} className="mt-4" />
    </section>
  )
}
