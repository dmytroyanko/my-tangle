import { getLocale } from 'next-intl/server'

import { getHomeCategories } from '@/entities/category'
import { getProductsByCategory } from '@/entities/product'
import type { Locale } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import { CategoryShowcase } from './CategoryShowcase'

// Categories with their products; a category without products to show is left out.
async function load(locale: Locale) {
  try {
    const categories = await getHomeCategories(locale)
    const blocks = await Promise.all(
      categories.map(async (category) => ({
        category,
        products: await getProductsByCategory(category.id, locale),
      })),
    )
    return blocks.filter((block) => block.products.length > 0)
  } catch (error) {
    // The rest of the page still renders when the database is unavailable.
    console.error('CategoryShowcases:', error)
    return []
  }
}

// Every category marked "show on the home page" in the admin, in menu order, separated by a line.
export async function CategoryShowcases({ id, className }: { id?: string; className?: string }) {
  const locale = (await getLocale()) as Locale
  const blocks = await load(locale)

  return (
    <div id={id} className={className}>
      {blocks.map(({ category, products }, index) => (
        <CategoryShowcase
          key={category.id}
          category={category}
          products={products}
          className={cn('py-12 md:py-16', index > 0 && 'border-t border-border')}
        />
      ))}
    </div>
  )
}
