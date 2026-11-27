// Imports the catalog from the JSON files in ./catalog, one file per category (the-complete-carebrush.json):
//   pnpm payload run src/payload/seed/catalog.ts                                 (every category)
//   CATEGORY=the-complete-carebrush pnpm payload run src/payload/seed/catalog.ts  (one file, by its name)
// Names and series come from the current site, full prices from the supplier; photos from the manufacturer's
// site, or from the current site or the supplier for colours the manufacturer does not show.
//
// A file describes a category by series, so text shared by a series is written once. On the site every
// colour is a product with its own page: a category with several series gets a subcategory per series,
// holding its colours; a category with one series holds the colours itself. The series' tags, description
// and characteristics go to that category (productInfo), which its products show.
//
// Safe to run again. By default it only creates what is missing: a category or product that already
// exists (matched by slug) is left as edited in the admin. SEED_UPDATE=1 overwrites them with the JSON.
// A photo is matched by a file name that includes a hash of its source URL, so a changed URL in the
// JSON uploads the new photo.
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { Category } from '@/payload/payload-types'
import { withBrand, type BrandKey } from '@/shared/config'
import { toSlug } from '@/shared/lib/slugify'

import {
  byLocale,
  findBySlug,
  type ImageSource,
  type Localized,
  readSeedFiles,
  richText,
  save,
  seedPath,
  UPDATE,
  upsertMedia,
} from './lib'

type Spec = { key: string; value: Localized<string> }

// One category file. Rich text fields use the light markup described at richText() in ./lib.ts.
type CatalogFile = {
  category: {
    // One slug for both languages, or each language's own.
    slug: string | Localized<string>
    // Catalog menu: a short two-line name and the icon key (see Categories).
    navTitle: Localized<string>
    navIcon: Category['navIcon']
    // Base of the category photo's file name.
    mediaKey: string
    order: number
    // A block on the home page, as on the current site.
    showOnHome: boolean
    // Key from src/shared/config/brands.ts; Tangle Teezer when left out.
    brand?: BrandKey
    // How the products are listed on the category page and on the home page (see ProductGrid); series
    // cards when left out.
    productView?: Category['productView']
    homeProductView?: Category['homeProductView']
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
  series: Series[]
}

type Series = {
  // Base of the photo file names; kept when slugs change, so the photos are not uploaded again.
  mediaKey: string
  // The product name without a colour, the same in both languages.
  title: string
  // Short name: the card badge, the filter chip and the subcategory's series name; left out when the
  // category has a single series.
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
  // The subcategory's own meta title and description, when the template (made for brushes) does not fit.
  meta?: { title: Localized<string>; description: Localized<string> }
  specs: Spec[]
  colours: {
    name: string
    // Swatch colour; left out for a product without colours (a spray), which then shows no palette.
    color?: string
    inStock: boolean
    // Only when it differs from the series' full price.
    fullPrice?: number
    // Own discount of this colour, where the supplier discounts it.
    discountPercent?: number
    images: ImageSource[]
  }[]
}

const CATALOG_DIR = seedPath(import.meta.url, 'catalog')

// What a product is in photo alt texts when its series does not say (`noun`).
const DEFAULT_NOUN: Localized<string> = { uk: 'Щітка', ru: 'Расческа' }

// Tags, description and characteristics of a series, shown by the products of the category that holds it.
// Characteristics are one list for both languages with a translated value: the Russian values are written
// to the rows saved with the Ukrainian ones (matched by row id); rows sent without ids would replace them.
async function saveProductInfo(payload: Payload, categoryId: number, series: Series) {
  let ids: (string | null | undefined)[] = []
  for (const locale of ['uk', 'ru'] as const) {
    const doc = await payload.update({
      collection: 'categories',
      id: categoryId,
      data: {
        productInfo: {
          tags: series.tags[locale],
          description: richText(series.description[locale]) as never,
          specs: series.specs.map((spec, i) => ({
            id: ids[i],
            key: spec.key as never,
            value: spec.value[locale],
          })),
        },
      },
      locale,
    })
    ids = (doc.productInfo?.specs ?? []).map((row) => row.id)
  }
}

async function importCategory(payload: Payload, { category, series }: CatalogFile) {
  const slugs = category.slug
  const ukSlug = typeof slugs === 'string' ? slugs : slugs.uk
  payload.logger.info(`== ${ukSlug}`)
  const brandKey = category.brand ?? 'tangle-teezer'
  const single = series.length === 1

  let categoryId = await findBySlug(payload, 'categories', ukSlug)
  if (categoryId && !UPDATE) {
    payload.logger.info('Category exists, skipped')
  } else {
    const image = await upsertMedia(payload, category.image, category.mediaKey, category.imageAlt)
    categoryId = await save(
      payload,
      'categories',
      categoryId,
      slugs,
      {
        order: category.order,
        showOnHome: category.showOnHome,
        brand: brandKey,
        navIcon: category.navIcon,
        parent: null,
        // Only when the JSON sets them, so an update keeps the admin's choice (new rows get the default).
        ...(category.productView && { productView: category.productView }),
        ...(category.homeProductView && { homeProductView: category.homeProductView }),
        image,
      },
      byLocale((locale) => ({
        title: category.title[locale],
        heading: category.heading[locale],
        subtitle: category.subtitle[locale],
        navTitle: category.navTitle[locale],
        description: richText(category.description[locale]),
        meta: {
          title: category.meta.title[locale],
          description: category.meta.description[locale],
        },
        benefits: category.benefits[locale],
        faq: category.faq[locale].map((item) => ({
          question: item.question,
          answer: richText(item.answer),
        })),
      })),
    )
    if (single) await saveProductInfo(payload, categoryId, series[0])
  }

  for (const item of series) {
    // The base series of The Ultimate Detangler is called like the category; its subcategory adds the series.
    const seriesTitle =
      !single && item.title === category.title.uk && item.series
        ? `${item.title} ${item.series}`
        : item.title
    let holderId = categoryId

    if (!single) {
      const seriesSlug = toSlug(withBrand(brandKey, seriesTitle), 'uk')
      const existing = await findBySlug(payload, 'categories', seriesSlug)
      if (existing && !UPDATE) {
        payload.logger.info(`${seriesTitle}: exists, skipped`)
        holderId = existing
      } else {
        payload.logger.info(`${seriesTitle}: subcategory`)
        holderId = await save(
          payload,
          'categories',
          existing,
          seriesSlug,
          {
            parent: categoryId,
            seriesName: item.series ?? null,
            order: item.order,
            brand: brandKey,
            showOnHome: false,
            // A series page lists its colours.
            productView: 'grid',
            navIcon: null,
          },
          byLocale((locale) => ({
            title: seriesTitle,
            heading: withBrand(brandKey, seriesTitle),
            meta: {
              title: item.meta?.title[locale] ?? null,
              description: item.meta?.description[locale] ?? null,
            },
          })),
        )
        await saveProductInfo(payload, holderId, item)
      }
    }

    for (const [index, colour] of item.colours.entries()) {
      const fullTitle = `${item.title} ${colour.name}`
      const slug = toSlug(withBrand(brandKey, fullTitle), 'uk')
      const productId = await findBySlug(payload, 'products', slug)
      if (productId && !UPDATE) {
        payload.logger.info(`${fullTitle}: exists, skipped`)
        continue
      }
      payload.logger.info(fullTitle)

      // Photo file names use the series' mediaKey, so new slugs do not upload the photos again.
      const name = `${item.mediaKey}-${toSlug(colour.name, 'uk')}`
      // A colour's photos are downloaded in parallel; Promise.all keeps their order.
      // Duplicates are dropped first: parallel find-then-create would upload the same photo twice.
      const sources = colour.images.filter(
        (image, i) =>
          colour.images.findIndex((other) => JSON.stringify(other) === JSON.stringify(image)) === i,
      )
      const images = await Promise.all(
        sources.map((url, i) =>
          upsertMedia(
            payload,
            url,
            `${name}-${i + 1}`,
            byLocale(
              (locale) =>
                `${item.noun?.[locale] ?? DEFAULT_NOUN[locale]} ${withBrand(brandKey, fullTitle)}, фото ${i + 1}`,
            ),
          ),
        ),
      )

      await save(
        payload,
        'products',
        productId,
        slug,
        {
          category: holderId,
          colorName: colour.name,
          color: colour.color ?? null,
          inStock: colour.inStock,
          order: index,
          fullPrice: colour.fullPrice ?? item.fullPrice,
          discountPercent: colour.discountPercent ?? item.discountPercent ?? null,
          images,
          _status: 'published',
        },
        byLocale(() => ({ title: item.title })),
      )
    }
  }
}

const files = readSeedFiles<CatalogFile>(CATALOG_DIR, process.env.CATEGORY)
const payload = await getPayload({ config })
for (const data of files) await importCategory(payload, data)
payload.logger.info('Done')
process.exit(0)
