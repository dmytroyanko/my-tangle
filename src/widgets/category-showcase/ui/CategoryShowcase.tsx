import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'

import { getCategoryBySlug } from '@/entities/category'
import { getProductsByCategory, ProductCard } from '@/entities/product'
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
// Series cards are large (photo, palette, button), so the grid has 2 columns, 3 from md.
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
          {category.subtitle && <p className="mt-3 text-base text-muted-foreground">{category.subtitle}</p>}
        </header>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-10">
          {products.map((product) => (
            <li key={product.id} className="@container">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {(category.image || category.description) && (
          <div className="mt-12 grid items-center gap-6 md:mt-16 md:grid-cols-2 md:gap-10 lg:gap-16">
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
                <h3 className="text-xl md:text-2xl">{category.title}</h3>
                <RichText data={category.description} className="mt-4 space-y-3 text-base text-foreground/80" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
