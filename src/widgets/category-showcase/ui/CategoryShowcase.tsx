import { getLocale } from 'next-intl/server'

import { CategoryAbout, type CategoryData } from '@/entities/category'
import { ProductGrid, type ProductCardData } from '@/entities/product'
import type { Locale } from '@/shared/i18n'

type Props = {
  category: CategoryData
  products: ProductCardData[]
  className?: string
}

// A category on the home page: heading, its series as cards, then a photo with the category description.
export async function CategoryShowcase({ category, products, className }: Props) {
  const locale = (await getLocale()) as Locale
  const slug = category.slugs[locale]
  if (!slug) return null
  const titleId = `${slug}-title`

  return (
    <section aria-labelledby={titleId} className={className}>
      <div className="container">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id={titleId} className="text-2xl leading-tight md:text-[1.75rem]">
            {category.heading}
          </h2>
          {category.subtitle && (
            <p className="mt-3 text-base text-muted-foreground">{category.subtitle}</p>
          )}
        </header>

        <ProductGrid products={products} basePath={`/${slug}`} className="mt-8 md:mt-10" />
        <CategoryAbout category={category} headingLevel="h3" className="mt-12 md:mt-16" />
      </div>
    </section>
  )
}
