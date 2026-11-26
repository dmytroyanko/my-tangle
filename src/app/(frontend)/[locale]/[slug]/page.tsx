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
import { getPageBySlug } from '@/entities/page'
import { getProductsByCategory, seriesKey } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { ProductViewSwitch } from '@/features/product-view-switch'
import { SeriesFilter } from '@/features/series-filter'
import { getPathname, routing, type Locale } from '@/shared/i18n'
import { pageMetadata } from '@/shared/lib/metadata'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { PageHeader } from '@/shared/ui/page-header'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { CatalogCta } from '@/widgets/catalog-cta'
import { DeliveryInfo } from '@/widgets/delivery-info'
import { InfoPage } from '@/widgets/info-page'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Pages at the site root (/<slug>): a category if one has this slug, else an information page from Payload
// (an article), else 404.

// Products come from Payload, so the page renders per request (see the home page).
export const dynamic = 'force-dynamic'

const localePaths = (slugs: Partial<Record<Locale, string>>) =>
  Object.fromEntries(Object.entries(slugs).map(([l, s]) => [l, `/${s}`])) as Partial<
    Record<Locale, string>
  >

// Both collections are tried in the current language first, so a page's own slug wins over another
// language's slug of a category; then by another language's slug (the page then redirects to its own).
async function resolve(slug: string, locale: Locale) {
  // The second pass skips the current locale, which the first one already tried.
  for (const otherLocales of [false, 'only'] as const) {
    const category = await getCategoryBySlug(slug, locale, otherLocales)
    if (category) return { category }
    const page = await getPageBySlug(slug, locale, otherLocales)
    if (page) return { page }
  }
  return {}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const { category, page } = await resolve(slug, locale)
  if (category)
    return pageMetadata({
      locale,
      paths: localePaths(category.slugs),
      title: category.meta.title || category.heading,
      description: category.meta.description || category.subtitle || undefined,
      image: category.meta.image,
    })
  if (!page) return {}
  return pageMetadata({
    locale,
    paths: localePaths(page.slugs),
    title: page.meta.title || page.title,
    description: page.meta.description ?? undefined,
    image: page.meta.image,
    type: 'article',
  })
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const { category, page } = await resolve(slug, locale)
  if (!category) {
    if (!page) notFound()
    const pagePath = `/${page.slugs[locale] ?? slug}`
    // One address per page, as for categories below.
    if (pagePath !== `/${slug}`) permanentRedirect(getPathname({ locale, href: pagePath }))
    return (
      <InfoPage page={page} path={pagePath} locale={locale}>
        <CatalogCta className="mt-12 max-w-3xl" />
      </InfoPage>
    )
  }
  const categoryPath = `/${category.slugs[locale] ?? slug}`
  // Reached by the slug of another language (/ru/<Ukrainian slug>): one address per page, so redirect to
  // this language's own one. Filters in the query string are dropped; they are not part of the page.
  if (categoryPath !== `/${slug}`) permanentRedirect(getPathname({ locale, href: categoryPath }))

  const [products, t, tCrumbs] = await Promise.all([
    getProductsByCategory(category.id, locale),
    getTranslations('CategoryPage'),
    getTranslations('Breadcrumbs'),
  ])
  const productList = (
    <ProductViewSwitch
      products={products}
      basePath={categoryPath}
      eager={3}
      buy={<AddToCartButton />}
      defaultView={category.productView}
      className="mt-8 md:mt-10"
    />
  )

  return (
    <>
      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          home={tCrumbs('home')}
          label={tCrumbs('label')}
          locale={locale}
          items={[{ name: category.title, href: categoryPath }]}
        />

        <PageHeader title={category.heading} lead={category.subtitle} />

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
            {productList}
          </SeriesFilter>
        ) : (
          productList
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
