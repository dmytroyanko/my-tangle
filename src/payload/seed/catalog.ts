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
import { createHash } from 'crypto'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { toSlug } from '@/shared/lib/slugify'

type Locale = 'uk' | 'ru'
type Localized<T> = Record<Locale, T>
// A photo URL, or a retailer photo padded onto a larger canvas: `crop` is the area to keep, `background`
// the canvas colour, which is lifted to white to match the manufacturer's photos, and `padding` the share
// of the width added around the photo when it fills the frame edge to edge.
type Crop = { left: number; top: number; width: number; height: number }
type ImageSource = string | { url: string; crop: Crop; background?: string; padding?: number }

// One category file. Rich text fields use the light markup described at richText() below.
type CatalogFile = {
  category: {
    slug: string
    // Base of the category photo's file name.
    mediaKey: string
    order: number
    // A block on the home page, as on the current site.
    showOnHome: boolean
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
    series: string
    order: number
    // Full price: the supplier's price minus 1 UAH. Payload works out the site price (minus the shop discount).
    fullPrice: number
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
      images: ImageSource[]
    }[]
  }[]
}

const CATALOG_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'catalog')

// Photos are stored as WebP, at most this many pixels on the long side. Next.js serves smaller sizes.
const MAX_IMAGE_SIZE = 1600

const UPDATE = process.env.SEED_UPDATE === '1'

// Lexical rich text from the light markup used in the JSON: blocks separated by a blank line, "### "
// headings, "- " bullet lists, **bold** and [text](url) inside a line.
const common = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

// Bold may wrap a link (**[text](url)**), so bold content is parsed again with the bold format.
function inline(line: string, format = 0): Record<string, unknown>[] {
  const text = (value: string) => ({
    type: 'text',
    text: value,
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    version: 1,
  })

  return line
    .split(/(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/)
    .filter(Boolean)
    .flatMap((part) => {
      const bold = part.match(/^\*\*(.+)\*\*$/)
      const link = part.match(/^\[(.+)\]\((.+)\)$/)
      if (bold) return inline(bold[1], format | 1)
      if (link)
        return [
          {
            ...common,
            type: 'link',
            version: 3,
            fields: { url: link[2], linkType: 'custom', newTab: false },
            children: inline(link[1], format),
          },
        ]
      return [text(part)]
    })
}

const richText = (markup: string) => ({
  root: {
    ...common,
    type: 'root',
    children: markup.split('\n\n').map((block) => {
      if (block.startsWith('### '))
        return { ...common, type: 'heading', tag: 'h3', children: inline(block.slice(4)) }
      if (block.startsWith('- '))
        return {
          ...common,
          type: 'list',
          listType: 'bullet',
          tag: 'ul',
          start: 1,
          children: block.split('\n').map((item, i) => ({
            ...common,
            type: 'listitem',
            value: i + 1,
            children: inline(item.slice(2)),
          })),
        }
      return { ...common, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(block) }
    }),
  },
})

async function download(image: ImageSource): Promise<Buffer> {
  const url = typeof image === 'string' ? image : image.url
  // Shopify resizes on its CDN, so the original 2000–4000px file is not downloaded.
  const source = new URL(url)
  if (source.host === 'cdn.shopify.com') source.searchParams.set('width', String(MAX_IMAGE_SIZE))
  const response = await fetch(source)
  if (!response.ok) throw new Error(`${response.status} ${source}`)

  let pipeline = sharp(Buffer.from(await response.arrayBuffer()))
  if (typeof image !== 'string') {
    pipeline = pipeline.extract(image.crop)
    if (image.background) {
      if (image.padding) {
        const pad = Math.round(image.crop.width * image.padding)
        pipeline = sharp(
          await pipeline
            .extend({ top: pad, bottom: pad, left: pad, right: pad, background: image.background })
            .toBuffer(),
        )
      }
      const channels = image.background.match(/[0-9a-f]{2}/gi)!.map((hex) => parseInt(hex, 16))
      pipeline = pipeline.linear(
        channels.map((value) => 255 / value),
        [0, 0, 0],
      )
    }
  }
  return pipeline
    .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

async function upsertMedia(
  payload: Payload,
  image: ImageSource,
  name: string,
  alt: Localized<string>,
) {
  const source = typeof image === 'string' ? image : JSON.stringify(image)
  const hash = createHash('sha1').update(source).digest('hex').slice(0, 8)
  const key = `${name}-${hash}`
  // `contains`, not `equals`: when a file of that name is already on disk (media/ outlived the database),
  // Payload saves the upload as key-1.webp.
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { contains: key } },
    limit: 1,
    depth: 0,
  })

  const found = existing.docs[0]
  if (found) {
    if (UPDATE) {
      await payload.update({
        collection: 'media',
        id: found.id,
        data: { alt: alt.uk },
        locale: 'uk',
      })
      await payload.update({
        collection: 'media',
        id: found.id,
        data: { alt: alt.ru },
        locale: 'ru',
      })
    }
    return found.id
  }

  const file = await download(image)
  const created = await payload.create({
    collection: 'media',
    data: { alt: alt.uk },
    file: { data: file, mimetype: 'image/webp', name: `${key}.webp`, size: file.length },
    locale: 'uk',
  })
  await payload.update({ collection: 'media', id: created.id, data: { alt: alt.ru }, locale: 'ru' })

  return created.id
}

async function findBySlug(payload: Payload, collection: 'categories' | 'products', slug: string) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    locale: 'uk',
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id
}

async function save(
  payload: Payload,
  collection: 'categories' | 'products',
  id: number | undefined,
  slug: string,
  shared: Record<string, unknown>,
  localized: Localized<Record<string, unknown>>,
) {
  // generateSlug: false keeps the given slug; otherwise Payload makes the Russian one from the title.
  const ukData = { ...shared, ...localized.uk, slug, generateSlug: false } as never
  const doc = id
    ? await payload.update({ collection, id, data: ukData, locale: 'uk' })
    : await payload.create({ collection, data: ukData, locale: 'uk' })
  await payload.update({
    collection,
    id: doc.id,
    data: { ...localized.ru, slug, generateSlug: false } as never,
    locale: 'ru',
  })

  return doc.id
}

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
      { order: category.order, showOnHome: category.showOnHome, image: categoryImage },
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
            uk: `${product.noun?.uk ?? 'Щітка'} Tangle Teezer ${product.title} ${variant.name}, фото ${index + 1}`,
            ru: `${product.noun?.ru ?? 'Расческа'} Tangle Teezer ${product.title} ${variant.name}, фото ${index + 1}`,
          }),
        ),
      )
      variants.push({
        name: variant.name,
        color: variant.color,
        inStock: variant.inStock,
        fullPrice: variant.fullPrice,
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
