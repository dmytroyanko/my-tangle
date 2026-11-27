import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { CategoryFaq } from '@/entities/category'
import {
  ProductGrid,
  ProductSpecs,
  ProductView,
  type ProductCardData,
  type ProductDetailsData,
} from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { brands, siteUrl, withBrand } from '@/shared/config'
import { absoluteUrl, type Locale } from '@/shared/i18n'
import { productJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { RichText, richTextClassName } from '@/shared/ui/rich-text'

type Props = {
  product: ProductDetailsData
  // The other series of the product's category, as cards under the page.
  others: ProductCardData[]
  // This product's path in the current locale, e.g. /tangle-teezer-the-ultimate-detangler-large-black-gloss.
  path: string
  locale: Locale
  // The delivery terms and the bundle offer, from their widgets.
  delivery: ReactNode
  bundle: ReactNode
}

// A product page: one colour of a series with the palette linking the other colours, then the
// description, characteristics, the bundle offer, the category's other series and its questions.
export async function ProductPage({ product, others, path, locale, delivery, bundle }: Props) {
  const [t, tCrumbs, tSpecs] = await Promise.all([
    getTranslations('ProductPage'),
    getTranslations('Breadcrumbs'),
    getTranslations('ProductSpecs'),
  ])
  const { category, series } = product
  const variant = series.variants[product.variantIndex]
  const parent = category.parent
  // The category the product is listed in: the parent of its subcategory, or its own category.
  const root = parent ?? { title: category.title, slug: category.slugs[locale], faq: category.faq }

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: withBrand(category.brand, product.name),
          brand: brands[category.brand],
          // The description shown on the page, not the meta description template.
          description: product.descriptionText ?? undefined,
          url: absoluteUrl(locale, path),
          images: variant.images.map((image) => new URL(image.url, siteUrl).href),
          prices: [variant.price],
          inStock: variant.inStock,
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
            ...(parent?.slug ? [{ name: parent.title, href: `/${parent.slug}` }] : []),
            ...(category.slugs[locale]
              ? [{ name: category.title, href: `/${category.slugs[locale]}` }]
              : []),
            { name: product.name, href: path },
          ]}
        />

        <div className="mt-6 md:mt-8">
          <ProductView
            // A new colour is a new page: the photo index starts again.
            key={product.id}
            product={series}
            selected={product.variantIndex}
            name={product.name}
            buy={<AddToCartButton size="page" />}
          >
            {delivery}
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

      {bundle}

      <div className="container py-12 md:py-16">
        {others.length > 0 && (
          <section aria-labelledby="others-title">
            <h2 id="others-title" className="text-xl md:text-2xl">
              {t('otherSeries', { title: root.title })}
            </h2>
            <ProductGrid products={others} buy={<AddToCartButton />} className="mt-6 md:mt-8" />
          </section>
        )}

        <CategoryFaq
          faq={category.faq.length ? category.faq : root.faq}
          className={others.length > 0 ? 'mt-12 md:mt-16' : undefined}
        />
      </div>
    </>
  )
}
