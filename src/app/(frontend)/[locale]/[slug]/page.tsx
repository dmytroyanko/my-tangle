import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import {
  CategoryAbout,
  CategoryBenefits,
  CategoryFaq,
  getCategoryBySlug,
} from '@/entities/category'
import { getProductsByCategory, ProductGrid, seriesKey } from '@/entities/product'
import { SeriesFilter } from '@/features/series-filter'
import { siteName, siteUrl } from '@/shared/config'
import { alternates, getPathname, routing, type Locale } from '@/shared/i18n'
import { breadcrumbJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { DeliveryInfo } from '@/widgets/delivery-info'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Products come from Payload, so the page renders per request (see the home page).
export const dynamic = 'force-dynamic'

const localePaths = (slugs: Partial<Record<Locale, string>>) =>
  Object.fromEntries(Object.entries(slugs).map(([l, s]) => [l, `/${s}`])) as Partial<
    Record<Locale, string>
  >

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const category = await getCategoryBySlug(slug, locale)
  if (!category) return {}

  const title = category.meta.title || category.heading
  const description = category.meta.description || category.subtitle || undefined
  const image = category.meta.image

  return {
    title,
    description,
    alternates: alternates(locale, localePaths(category.slugs)),
    openGraph: {
      title,
      description,
      siteName,
      images: image
        ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }]
        : undefined,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const category = await getCategoryBySlug(slug, locale)
  if (!category) notFound()
  const categoryPath = `/${category.slugs[locale] ?? slug}`
  // Reached by the slug of another language (/ru/<Ukrainian slug>): one address per page, so redirect to
  // this language's own one. Filters in the query string are dropped; they are not part of the page.
  if (categoryPath !== `/${slug}`) permanentRedirect(getPathname({ locale, href: categoryPath }))

  const [products, t, tCrumbs] = await Promise.all([
    getProductsByCategory(category.id, locale),
    getTranslations('CategoryPage'),
    getTranslations('Breadcrumbs'),
  ])
  const absolute = (href: string) => new URL(getPathname({ locale, href }), siteUrl).href

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCrumbs('home'), url: absolute('/') },
          { name: category.title, url: absolute(categoryPath) },
        ])}
      />

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          label={tCrumbs('label')}
          items={[{ name: tCrumbs('home'), href: '/' }, { name: category.title }]}
        />

        <header className="mt-6 md:mt-8">
          <h1 className="text-[1.75rem] leading-tight md:text-4xl">{category.heading}</h1>
          {category.subtitle && (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{category.subtitle}</p>
          )}
        </header>

        {/* Outline heading for the cards (h3), visible to screen readers and search engines. */}
        <h2 className="sr-only">{t('products', { title: category.title })}</h2>

        {products.length > 1 ? (
          <SeriesFilter
            options={products.map((product) => ({
              value: seriesKey(product),
              label: product.series ?? product.title,
            }))}
            className="mt-6"
          >
            <ProductGrid
              products={products}
              basePath={categoryPath}
              eager={3}
              className="mt-8 md:mt-10"
            />
          </SeriesFilter>
        ) : (
          <ProductGrid
            products={products}
            basePath={categoryPath}
            eager={3}
            className="mt-8 md:mt-10"
          />
        )}

        <CategoryBenefits
          benefits={category.benefits}
          className="mt-12 rounded-xl bg-muted px-5 py-5 md:mt-16 md:px-6"
        />
        <DeliveryInfo className="mt-6" />
      </div>

      <BundleDiscount />

      <div className="container py-12 md:py-16">
        <CategoryAbout category={category} />
        <CategoryFaq faq={category.faq} className="mt-12 md:mt-16" />
      </div>
    </>
  )
}
