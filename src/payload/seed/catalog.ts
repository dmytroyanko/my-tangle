// Imports catalog categories with their series and colours from the JSON files in ./catalog, one file per
// category (the-complete-carebrush.json):
//   pnpm payload run src/payload/seed/catalog.ts                              (every category)
//   CATEGORY=the-complete-carebrush pnpm payload run src/payload/seed/catalog.ts   (one category)
// Names and series come from the current site, full prices from the supplier; photos from the manufacturer's
// site, or from the current site or the supplier for colours the manufacturer does not show.
//
// Safe to run again. By default it only creates what is missing: a category or product that already
// exists (matched by slug) is left as edited in the admin. SEED_UPDATE=1 overwrites them with the JSON.
// A photo is matched by a file name that includes a hash of its source URL, so a changed URL in the
// JSON uploads the new photo.
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { withBrand, type BrandKey } from '@/shared/config'
import { toSlug } from '@/shared/lib/slugify'

import {
  findBySlug,
  type ImageSource,
  type Locale,
  type Localized,
  richText,
  save,
  UPDATE,
  upsertMedia,
} from './lib'

// One category file. Rich text fields use the light markup described at richText() in ./lib.ts.
type CatalogFile = {
  category: {
    slug: string
    // Base of the category photo's file name.
    mediaKey: string
    order: number
    // A block on the home page, as on the current site.
    showOnHome: boolean
    // Key from src/shared/config/brands.ts; Tangle Teezer when left out.
    brand?: BrandKey
    title: Localized<string>
    heading: Localized<string>
    subtitle: Localized<string>
    description: Localized<string>
    image: ImageSource
    imageAlt: Localized<string>
    meta: { title: Localized<string>; description: Localized<string> }
    benefits: Localized<{ icon: string; title: string; text?: string }[]>
    faq: Localized<{ question: string; answer: string }[]>
  }
  products: {
    slug: string
    // Base of the photo file names; kept when the slug changes, so the photos are not uploaded again.
    mediaKey: string
    title: string
    // Card badge and filter chip; left out when the category has a single product.
    series?: string
    order: number
    // Full price: the supplier's price minus 1 UAH. Payload works out the site price (minus the shop discount).
    fullPrice: number
    // Own discount instead of the shop one (0 for none), e.g. Invisibobble, discounted only where the
    // supplier does.
    discountPercent?: number
    tags: Localized<string[]>
    description: Localized<string>
    // What the product is, for photo alt texts; brushes by default ("Щітка"), a spray says so.
    noun?: Localized<string>
    // Own meta title and description, when the product page template (made for brushes) does not fit.
    meta?: { title: Localized<string>; description: Localized<string> }
    specs: { key: string; value: Localized<string> }[]
    variants: {
      name: string
      // Swatch colour; left out for a product without colours (a spray), which then shows no palette.
      color?: string
      inStock: boolean
      // Only when it differs from the product's full price.
      fullPrice?: number
      // Own discount of this colour, where the supplier discounts it.
      discountPercent?: number
      images: ImageSource[]
    }[]
  }[]
}

const CATALOG_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'catalog')

// Characteristics are one list for both languages with a translated value. The Russian values are written
// to the rows saved with the Ukrainian ones (matched by row id); rows sent without ids would replace them.
async function saveSpecs(
  payload: Payload,
  id: number,
  specs: { key: string; value: Localized<string> }[],
) {
  const data = (locale: Locale, ids: (string | null | undefined)[] = []) =>
    ({
      specs: specs.map((spec, i) => ({ id: ids[i], key: spec.key, value: spec.value[locale] })),
    }) as never
  const doc = await payload.update({ collection: 'products', id, data: data('uk'), locale: 'uk' })
  await payload.update({
    collection: 'products',
    id,
    data: data(
      'ru',
      (doc.specs ?? []).map((row) => row.id),
    ),
    locale: 'ru',
  })
}

async function importCategory(payload: Payload, { category, products }: CatalogFile) {
  payload.logger.info(`== ${category.slug}`)
  const brandKey = category.brand ?? 'tangle-teezer'

  let categoryId = await findBySlug(payload, 'categories', category.slug)
  if (categoryId && !UPDATE) {
    payload.logger.info('Category exists, skipped')
  } else {
    payload.logger.info('Category')
    const categoryImage = await upsertMedia(
      payload,
      category.image,
      category.mediaKey,
      category.imageAlt,
    )
    categoryId = await save(
      payload,
      'categories',
      categoryId,
      category.slug,
      {
        order: category.order,
        showOnHome: category.showOnHome,
        brand: brandKey,
        image: categoryImage,
      },
      {
        uk: {
          title: category.title.uk,
          heading: category.heading.uk,
          subtitle: category.subtitle.uk,
          description: richText(category.description.uk),
          meta: { title: category.meta.title.uk, description: category.meta.description.uk },
          benefits: category.benefits.uk,
          faq: category.faq.uk.map((item) => ({
            question: item.question,
            answer: richText(item.answer),
          })),
        },
        ru: {
          title: category.title.ru,
          heading: category.heading.ru,
          subtitle: category.subtitle.ru,
          description: richText(category.description.ru),
          meta: { title: category.meta.title.ru, description: category.meta.description.ru },
          benefits: category.benefits.ru,
          faq: category.faq.ru.map((item) => ({
            question: item.question,
            answer: richText(item.answer),
          })),
        },
      },
    )
  }

  for (const product of products) {
    const productId = await findBySlug(payload, 'products', product.slug)
    if (productId && !UPDATE) {
      payload.logger.info(`${product.title}: exists, skipped`)
      continue
    }

    payload.logger.info(`${product.title}: ${product.variants.length} colours`)
    const variants = []
    for (const variant of product.variants) {
      // Photo file names use mediaKey (the first, longer slug), so shortening a product URL does not
      // upload the photos again.
      const name = `${product.mediaKey}-${toSlug(variant.name, 'uk')}`
      // A colour's photos are downloaded in parallel; Promise.all keeps their order.
      // Duplicates are dropped first: parallel find-then-create would upload the same photo twice.
      const sources = variant.images.filter(
        (image, index) =>
          variant.images.findIndex((other) => JSON.stringify(other) === JSON.stringify(image)) ===
          index,
      )
      const images = await Promise.all(
        sources.map((url, index) =>
          upsertMedia(payload, url, `${name}-${index + 1}`, {
            uk: `${product.noun?.uk ?? 'Щітка'} ${withBrand(brandKey, product.title)} ${variant.name}, фото ${index + 1}`,
            ru: `${product.noun?.ru ?? 'Расческа'} ${withBrand(brandKey, product.title)} ${variant.name}, фото ${index + 1}`,
          }),
        ),
      )
      variants.push({
        name: variant.name,
        color: variant.color,
        inStock: variant.inStock,
        fullPrice: variant.fullPrice,
        discountPercent: variant.discountPercent,
        images,
      })
    }

    const savedId = await save(
      payload,
      'products',
      productId,
      product.slug,
      {
        category: categoryId,
        series: product.series,
        order: product.order,
        fullPrice: product.fullPrice,
        discountPercent: product.discountPercent,
        variants,
        _status: 'published',
      },
      {
        uk: {
          title: product.title,
          tags: product.tags.uk,
          description: richText(product.description.uk),
          ...(product.meta && {
            meta: { title: product.meta.title.uk, description: product.meta.description.uk },
          }),
        },
        ru: {
          title: product.title,
          tags: product.tags.ru,
          description: richText(product.description.ru),
          ...(product.meta && {
            meta: { title: product.meta.title.ru, description: product.meta.description.ru },
          }),
        },
      },
    )
    await saveSpecs(payload, savedId, product.specs)
  }
}

const only = process.env.CATEGORY
const files = readdirSync(CATALOG_DIR)
  .filter((file) => file.endsWith('.json') && (!only || file === `${only}.json`))
  .sort()
if (!files.length) throw new Error(`No catalog file for CATEGORY=${only}`)

const payload = await getPayload({ config })
for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(CATALOG_DIR, file), 'utf8')) as CatalogFile
  await importCategory(payload, data)
}
payload.logger.info('Done')
process.exit(0)
