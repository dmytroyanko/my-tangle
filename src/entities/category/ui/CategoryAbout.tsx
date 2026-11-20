import Image from 'next/image'

import { cn } from '@/shared/lib/utils'
import { RichText, richTextClassName } from '@/shared/ui/rich-text'

import type { CategoryData } from '../api/getCategoryBySlug'

type Props = {
  category: Pick<CategoryData, 'title' | 'image' | 'description'>
  // Heading level: h2 on the category page, h3 inside the home page showcase.
  headingLevel?: 'h2' | 'h3'
  className?: string
}

// Category photo with its description, side by side from md.
export function CategoryAbout({ category, headingLevel: Heading = 'h2', className }: Props) {
  if (!category.image && !category.description) return null

  return (
    <div className={cn('grid items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-16', className)}>
      {category.image && (
        <Image
          src={category.image.url}
          alt={category.image.alt}
          width={category.image.width}
          height={category.image.height}
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          className="aspect-square w-full rounded-xl object-cover"
        />
      )}
      {category.description && (
        <div>
          <Heading className="text-xl md:text-2xl">{category.title}</Heading>
          <RichText
            data={category.description}
            headingTag={Heading === 'h2' ? 'h3' : 'h4'}
            className={cn('mt-4', richTextClassName)}
          />
        </div>
      )}
    </div>
  )
}
