import { cn } from '@/shared/lib/utils'

import type { CategoryData } from '../api/getCategoryBySlug'
import { benefitIcons } from '../model/benefitIcons'

// Short benefits with icons, under the product grid: one row from md, 2×2 on phones, where only the
// titles are shown to keep the block compact.
export function CategoryBenefits({
  benefits,
  className,
}: {
  benefits: CategoryData['benefits']
  className?: string
}) {
  if (!benefits.length) return null

  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4 md:grid-cols-4 md:gap-6',
        className,
      )}
    >
      {benefits.map((benefit, i) => {
        const Icon = benefitIcons[benefit.icon]
        return (
          <li
            key={`${i}-${benefit.title}`}
            className="flex items-center gap-2.5 sm:items-start sm:gap-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warm text-warm-foreground sm:size-10">
              <Icon className="size-4 sm:size-5" aria-hidden="true" />
            </span>
            <span className="sm:pt-0.5">
              <span className="block text-xs leading-snug font-semibold sm:text-sm">
                {benefit.title}
              </span>
              {benefit.text && (
                <span className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">
                  {benefit.text}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
