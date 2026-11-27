import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import {
  CategoryAbout,
  CategoryBenefits,
  CategoryFaq,
  type CategoryData,
} from '@/entities/category'
import type { ProductCardData } from '@/entities/product'
import { brands, siteUrl, withBrand } from '@/shared/config'
import { absoluteUrl, type Locale } from '@/shared/i18n'
import { productGroupJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { PageHeader } from '@/shared/ui/page-header'
import { RichText, richTextClassName } from '@/shared/ui/rich-text'

type Props = {
  category: CategoryData
  // The category's series with their colours (see getProductsByCategory), for structured data.
  products: ProductCardData[]
  // The product list as the route composes it (series filter, view switch).
  list: ReactNode
  // This category's path in the current locale, e.g. /tangle-teezer-the-ultimate-detangler.
  path: string
  locale: Locale
  // The delivery terms and the bundle offer, from their widgets.
  delivery: ReactNode
  bundle: ReactNode
}

// A category page: a category lists the series of its subcategories (a filter by series when there are
// several), a subcategory the colours of its series. Below: benefits, delivery, the bundle offer, the
// description and the questions (a subcategory shows its parent's).
export async function CategoryPage({
  category,
  products,
  list,
  path,
  locale,
  delivery,
  bundle,
}: Props) {
  const [t, tCrumbs, tProduct] = await Promise.all([
    getTranslations('CategoryPage'),
    getTranslations('Breadcrumbs'),
    getTranslations('ProductPage'),
  ])
  const parent = category.parent
  // A category without subcategories holds one series itself: its page is that series' page.
  const series = products.length === 1 && products[0].id === category.id ? products[0] : null

  return (
    <>
      {series && (
        <JsonLd
          data={productGroupJsonLd({
            name: withBrand(category.brand, series.title),
            brand: brands[category.brand],
            url: absoluteUrl(locale, path),
            groupId: category.slugs[locale] ?? String(category.id),
            variants: series.variants.map((variant) => ({
              name: withBrand(category.brand, `${series.title} ${variant.name}`),
              url: absoluteUrl(locale, `/${variant.slug}`),
              image: variant.images[0] && new URL(variant.images[0].url, siteUrl).href,
              price: variant.price,
              inStock: variant.inStock,
            })),
          })}
        />
      )}

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          home={tCrumbs('home')}
          label={tCrumbs('label')}
          locale={locale}
          items={[
            ...(parent?.slug ? [{ name: parent.title, href: `/${parent.slug}` }] : []),
            { name: category.title, href: path },
          ]}
        />

        <PageHeader title={category.heading} lead={category.subtitle} />

        {/* Outline heading for the cards (h3), visible to screen readers and search engines. */}
        <h2 className="sr-only">{t(parent ? 'colors' : 'products', { title: category.title })}</h2>

        {list}

        <CategoryBenefits
          benefits={category.benefits}
          className="mt-12 rounded-xl bg-muted px-5 py-5 md:mt-16 md:px-6"
        />
        <div className="mt-6">{delivery}</div>
      </div>

      {bundle}

      <div className="container py-12 md:py-16">
        {category.description ? (
          <CategoryAbout category={category} />
        ) : (
          category.productDescription && (
            <section aria-labelledby="description-title" className="max-w-3xl">
              <h2 id="description-title" className="text-xl md:text-2xl">
                {tProduct('description')}
              </h2>
              <RichText
                data={category.productDescription}
                className={`mt-4 ${richTextClassName}`}
              />
            </section>
          )
        )}
        <CategoryFaq
          faq={category.faq.length ? category.faq : (parent?.faq ?? [])}
          className="mt-12 md:mt-16"
        />
      </div>
    </>
  )
}
