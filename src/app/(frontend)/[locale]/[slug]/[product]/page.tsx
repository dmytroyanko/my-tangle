import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CategoryFaq, getCategoryBySlug } from '@/entities/category'
import {
  getProductBySlug,
  getProductsByCategory,
  ProductGrid,
  ProductSpecs,
  ProductView,
} from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { brands, siteUrl, withBrand } from '@/shared/config'
import { absoluteUrl, getPathname, routing, type Locale } from '@/shared/i18n'
import { pageMetadata } from '@/shared/lib/metadata'
import { productJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { RichText, richTextClassName } from '@/shared/ui/rich-text'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { DeliveryInfo } from '@/widgets/delivery-info'

type Props = {
  params: Promise<{ locale: string; slug: string; product: string }>
  searchParams: Promise<{ color?: string | string[] }>
}

// Products come from Payload, so the page renders per request (see the home page).
export const dynamic = 'force-dynamic'

async function load(locale: string, slug: string, productSlug: string) {
  if (!hasLocale(routing.locales, locale)) return null
  const category = await getCategoryBySlug(slug, locale)
  if (!category) return null
  const product = await getProductBySlug(productSlug, category.id, locale)
  if (!product) return null
  return { locale, category, product }
}

// Path of the product in every language that has both a category and a product slug.
const localePaths = (
  categorySlugs: Partial<Record<Locale, string>>,
  productSlugs: Partial<Record<Locale, string>>,
) =>
  Object.fromEntries(
    routing.locales
      .filter((l) => categorySlugs[l] && productSlugs[l])
      .map((l) => [l, `/${categorySlugs[l]}/${productSlugs[l]}`]),
  ) as Partial<Record<Locale, string>>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, product: productSlug } = await params
  const data = await load(locale, slug, productSlug)
  if (!data) return {}
  const { category, product } = data
  const t = await getTranslations({ locale: data.locale, namespace: 'ProductPage' })

  const prices = product.variants.map((variant) => variant.price)
  const title =
    product.meta.title || t('metaTitle', { name: withBrand(category.brand, product.title) })
  const description =
    product.meta.description ||
    t('metaDescription', {
      brand: category.brand,
      name: withBrand(category.brand, product.title),
      count: product.variants.length,
      price: Math.min(...prices),
    })

  return pageMetadata({
    locale: data.locale,
    paths: localePaths(category.slugs, product.slugs),
    title,
    description,
    image: product.variants[0]?.images[0],
  })
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { locale, slug, product: productSlug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const category = await getCategoryBySlug(slug, locale)
  if (!category) notFound()

  // The product and the other series of its category load in parallel.
  const [product, siblings, { color }, t, tCrumbs, tSpecs] = await Promise.all([
    getProductBySlug(productSlug, category.id, locale),
    getProductsByCategory(category.id, locale),
    searchParams,
    getTranslations('ProductPage'),
    getTranslations('Breadcrumbs'),
    getTranslations('ProductSpecs'),
  ])
  if (!product) notFound()

  const categoryPath = `/${category.slugs[locale] ?? slug}`
  const productPath = `${categoryPath}/${product.slugs[locale] ?? productSlug}`
  const colorParam = Array.isArray(color) ? color[0] : color
  // Reached by the slug of another language (/ru/<Ukrainian slug>): one address per page, so redirect to
  // this language's own one, keeping the colour.
  if (productPath !== `/${slug}/${productSlug}`) {
    const href = getPathname({ locale, href: productPath })
    permanentRedirect(colorParam ? `${href}?color=${encodeURIComponent(colorParam)}` : href)
  }

  const others = siblings.filter((sibling) => sibling.id !== product.id)
  const prices = product.variants.map((variant) => variant.price)
  // The last breadcrumb.
  const crumbName = product.series ?? product.title

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: withBrand(category.brand, product.title),
          brand: brands[category.brand],
          // The description shown on the page, not the meta description template.
          description: product.descriptionText ?? undefined,
          url: absoluteUrl(locale, productPath),
          images: product.variants
            .flatMap((variant) => variant.images.slice(0, 1))
            .map((image) => new URL(image.url, siteUrl).href),
          prices,
          inStock: product.variants.some((variant) => variant.inStock),
          // Brand is a field of its own in Product, so only the product's characteristics go here.
          properties: product.specs.map((spec) => ({
            name: tSpecs(`keys.${spec.key}`),
            value: spec.value,
          })),
        })}
      />

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          home={tCrumbs('home')}
          label={tCrumbs('label')}
          locale={locale}
          items={[
            { name: category.title, href: categoryPath },
            { name: crumbName, href: productPath },
          ]}
        />

        <div className="mt-6 md:mt-8">
          <ProductView
            product={product}
            initialColor={colorParam}
            href={productPath}
            buy={<AddToCartButton size="page" />}
          >
            <DeliveryInfo />
          </ProductView>
        </div>

        {product.description && (
          <section aria-labelledby="description-title" className="mt-12 max-w-3xl md:mt-16">
            <h2 id="description-title" className="text-xl md:text-2xl">
              {t('description')}
            </h2>
            <RichText data={product.description} className={`mt-4 ${richTextClassName}`} />
          </section>
        )}

        <ProductSpecs
          specs={product.specs}
          brand={category.brand}
          className="mt-12 max-w-3xl md:mt-16"
        />
      </div>

      <BundleDiscount />

      <div className="container py-12 md:py-16">
        <CategoryFaq faq={category.faq} />

        {others.length > 0 && (
          <section aria-labelledby="others-title" className="mt-12 md:mt-16">
            <h2 id="others-title" className="text-xl md:text-2xl">
              {t('otherSeries', { title: category.title })}
            </h2>
            <ProductGrid
              products={others}
              basePath={categoryPath}
              buy={<AddToCartButton />}
              className="mt-6 md:mt-8"
            />
          </section>
        )}
      </div>
    </>
  )
}
