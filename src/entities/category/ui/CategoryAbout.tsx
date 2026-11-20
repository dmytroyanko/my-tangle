import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

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
    <div className={`grid items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-16 ${className ?? ''}`}>
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
          <RichText data={category.description} className="mt-4 space-y-3 text-base text-foreground/80" />
        </div>
      )}
    </div>
  )
}
