import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getCategoryBySlug } from '@/entities/category'
import { getPageBySlug } from '@/entities/page'
import { getProductBySlug, getProductsByCategory, seriesKey } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { ProductViewSwitch } from '@/features/product-view-switch'
import { SeriesFilter } from '@/features/series-filter'
import { withBrand } from '@/shared/config'
import { getPathname, routing, type Locale } from '@/shared/i18n'
import { pageMetadata } from '@/shared/lib/metadata'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { CatalogCta } from '@/widgets/catalog-cta'
import { CategoryPage } from '@/widgets/category-page'
import { DeliveryInfo } from '@/widgets/delivery-info'
import { InfoPage } from '@/widgets/info-page'
import { ProductPage } from '@/widgets/product-page'

type Props = { params: Promise<{ locale: string; slug: string }> }

// Every page of the catalog and every article lives at the site root (/<slug>): a category or subcategory,
// else a product (one colour), else an information page from Payload, else 404.

// Products come from Payload, so the page renders per request (see the home page).
export const dynamic = 'force-dynamic'

const localePaths = (slugs: Partial<Record<Locale, string>>) =>
  Object.fromEntries(Object.entries(slugs).map(([l, s]) => [l, `/${s}`])) as Partial<
    Record<Locale, string>
  >

// Every collection is tried in the current language first, so a page's own slug wins over another
// language's slug of something else; then by another language's slug (the page then redirects to its own).
async function resolve(slug: string, locale: Locale) {
  // The second pass skips the current locale, which the first one already tried.
  for (const otherLocales of [false, 'only'] as const) {
    const category = await getCategoryBySlug(slug, locale, otherLocales)
    if (category) return { category }
    const product = await getProductBySlug(slug, locale, otherLocales)
    if (product) return { product }
    const page = await getPageBySlug(slug, locale, otherLocales)
    if (page) return { page }
  }
  return {}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const { category, product, page } = await resolve(slug, locale)

  if (category) {
    // A page of one series (a subcategory, or a category without subcategories) without its own SEO texts
    // gets the series template: name, colours, price. The same test as CategoryPage's ProductGroup.
    const products = await getProductsByCategory(category.id, locale)
    const series = products.length === 1 && products[0].id === category.id ? products[0] : null
    const t = await getTranslations({ locale, namespace: 'ProductPage' })
    const name = withBrand(category.brand, category.title)
    const prices = series?.variants.map((variant) => variant.price) ?? []
    return pageMetadata({
      locale,
      paths: localePaths(category.slugs),
      title: category.meta.title || (series ? t('metaTitle', { name }) : category.heading),
      description:
        category.meta.description ||
        (series && prices.length
          ? t('metaDescription', {
              brand: category.brand,
              name,
              count: series.variants.length,
              price: Math.min(...prices),
            })
          : category.subtitle || undefined),
      image: category.meta.image ?? series?.variants[0]?.images[0],
    })
  }

  if (product) {
    const t = await getTranslations({ locale, namespace: 'ProductPage' })
    const name = withBrand(product.category.brand, product.name)
    const variant = product.series.variants[product.variantIndex]
    return pageMetadata({
      locale,
      paths: localePaths(product.slugs),
      title: product.meta.title || t('metaTitle', { name }),
      description:
        product.meta.description ||
        t('colorMetaDescription', { brand: product.category.brand, name, price: variant.price }),
      image: variant.images[0],
    })
  }

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

export default async function SlugPage({ params }: Props) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const { category, product, page } = await resolve(slug, locale)
  const slugs = category?.slugs ?? product?.slugs ?? page?.slugs
  if (!slugs) notFound()
  const path = `/${slugs[locale] ?? slug}`
  // Reached by the slug of another language (/ru/<Ukrainian slug>): one address per page, so redirect to
  // this language's own one. Filters in the query string are dropped; they are not part of the page.
  if (path !== `/${slug}`) permanentRedirect(getPathname({ locale, href: path }))

  if (category) {
    const products = await getProductsByCategory(category.id, locale)
    const list = (
      <ProductViewSwitch
        products={products}
        eager={3}
        buy={<AddToCartButton />}
        defaultView={category.productView}
        className="mt-8 md:mt-10"
      />
    )
    return (
      <CategoryPage
        category={category}
        products={products}
        list={
          // A filter by series when the category has several.
          products.length > 1 ? (
            <SeriesFilter
              options={products.map((card) => ({
                value: seriesKey(card),
                label: card.series ?? card.title,
              }))}
              className="mt-6"
            >
              {list}
            </SeriesFilter>
          ) : (
            list
          )
        }
        path={path}
        locale={locale}
        delivery={<DeliveryInfo />}
        bundle={<BundleDiscount />}
      />
    )
  }

  if (product) {
    // The other series of the category the product is listed in.
    const rootId = product.category.parent?.id ?? product.category.id
    const others = (await getProductsByCategory(rootId, locale)).filter(
      (series) => series.id !== product.series.id,
    )
    return (
      <ProductPage
        product={product}
        others={others}
        path={path}
        locale={locale}
        delivery={<DeliveryInfo />}
        bundle={<BundleDiscount />}
      />
    )
  }

  return (
    <InfoPage page={page!} path={path} locale={locale}>
      <CatalogCta className="mt-12 max-w-3xl" />
    </InfoPage>
  )
}
