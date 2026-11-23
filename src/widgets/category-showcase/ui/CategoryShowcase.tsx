import { getLocale } from 'next-intl/server'

import { CategoryAbout, getCategoryBySlug } from '@/entities/category'
import { getProductsByCategory, ProductGrid } from '@/entities/product'
import type { Locale } from '@/shared/i18n'

type Props = {
  slug: string
  id?: string
  className?: string
}

async function load(slug: string, locale: Locale) {
  try {
    const category = await getCategoryBySlug(slug, locale)
    if (!category) return null
    return { category, products: await getProductsByCategory(category.id, locale) }
  } catch (error) {
    // The rest of the page still renders when the database is unavailable.
    console.error(`CategoryShowcase "${slug}":`, error)
    return null
  }
}

// A category on the home page: heading, its series as cards, then a photo with the category description.
export async function CategoryShowcase({ slug, id, className }: Props) {
  const locale = (await getLocale()) as Locale
  const data = await load(slug, locale)
  if (!data) return null
  const { category, products } = data
  const titleId = `${id ?? slug}-title`

  return (
    <section id={id} aria-labelledby={titleId} className={className}>
      <div className="container">
        <header className="mx-auto max-w-2xl text-center">
          <h2 id={titleId} className="text-2xl leading-tight md:text-[1.75rem]">
            {category.heading}
          </h2>
          {category.subtitle && (
            <p className="mt-3 text-base text-muted-foreground">{category.subtitle}</p>
          )}
        </header>

        <ProductGrid
          products={products}
          basePath={`/${category.slugs[locale] ?? slug}`}
          className="mt-8 md:mt-10"
        />
        <CategoryAbout category={category} headingLevel="h3" className="mt-12 md:mt-16" />
      </div>
    </section>
  )
}
