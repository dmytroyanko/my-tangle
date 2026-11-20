// Imports The Ultimate Detangler category with its series and colours from ultimate-detangler.json:
//   pnpm payload run src/payload/seed/ultimate-detangler.ts
// Data (names, prices, series) comes from the current site; photos from tangleteezer.com, or from the
// current site for colours the manufacturer no longer shows.
//
// Safe to run again. By default it only creates what is missing: a category or product that already
// exists (matched by slug) is left as edited in the admin. SEED_UPDATE=1 overwrites them with the JSON.
// A photo is matched by a file name that includes a hash of its source URL, so a changed URL in the
// JSON uploads the new photo.
import { createHash } from 'crypto'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { toSlug } from '@/shared/lib/slugify'

import data from './ultimate-detangler.json'

type Locale = 'uk' | 'ru'
type Localized<T> = Record<Locale, T>
// A photo URL, or a retailer photo padded onto a larger canvas: `crop` is the area to keep, `background`
// the canvas colour, which is lifted to white to match the manufacturer's photos, and `padding` the share
// of the width added around the photo when it fills the frame edge to edge.
type Crop = { left: number; top: number; width: number; height: number }
type ImageSource = string | { url: string; crop: Crop; background?: string; padding?: number }

// Photos are stored as WebP, at most this many pixels on the long side. Next.js serves smaller sizes.
const MAX_IMAGE_SIZE = 1600

const UPDATE = process.env.SEED_UPDATE === '1'

const paragraphs = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: text.split('\n\n').map((paragraph) => ({
      type: 'paragraph',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
      children: [{ type: 'text', text: paragraph, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})

async function download(image: ImageSource): Promise<Buffer> {
  const url = typeof image === 'string' ? image : image.url
  // Shopify resizes on its CDN, so the original 2000–4000px file is not downloaded.
  const source = url.includes('cdn.shopify.com') ? `${url}?width=${MAX_IMAGE_SIZE}` : url
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

async function upsertMedia(payload: Payload, image: ImageSource, name: string, alt: Localized<string>) {
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
      await payload.update({ collection: 'media', id: found.id, data: { alt: alt.uk }, locale: 'uk' })
      await payload.update({ collection: 'media', id: found.id, data: { alt: alt.ru }, locale: 'ru' })
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
  const ukData = { ...shared, ...localized.uk, slug } as never
  const doc = id
    ? await payload.update({ collection, id, data: ukData, locale: 'uk' })
    : await payload.create({ collection, data: ukData, locale: 'uk' })
  await payload.update({ collection, id: doc.id, data: { ...localized.ru, slug } as never, locale: 'ru' })

  return doc.id
}

async function run() {
  const payload = await getPayload({ config })
  const { category, products } = data

  let categoryId = await findBySlug(payload, 'categories', category.slug)
  if (categoryId && !UPDATE) {
    payload.logger.info('Category exists, skipped')
  } else {
    payload.logger.info('Category')
    const categoryImage = await upsertMedia(payload, category.image, 'ud-category', category.imageAlt)
    categoryId = await save(
      payload,
      'categories',
      categoryId,
      category.slug,
      { order: category.order, image: categoryImage },
      {
        uk: {
          title: category.title.uk,
          heading: category.heading.uk,
          subtitle: category.subtitle.uk,
          description: paragraphs(category.description.uk),
          meta: { title: category.meta.title.uk, description: category.meta.description.uk },
        },
        ru: {
          title: category.title.ru,
          heading: category.heading.ru,
          subtitle: category.subtitle.ru,
          description: paragraphs(category.description.ru),
          meta: { title: category.meta.title.ru, description: category.meta.description.ru },
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
      const name = `${product.slug}-${toSlug(variant.name, 'uk')}`
      // A colour's photos are downloaded in parallel; Promise.all keeps their order.
      const images = await Promise.all(
        variant.images.map((url, index) =>
          upsertMedia(payload, url, `${name}-${index + 1}`, {
            uk: `Щітка Tangle Teezer ${product.title} ${variant.name}, фото ${index + 1}`,
            ru: `Расческа Tangle Teezer ${product.title} ${variant.name}, фото ${index + 1}`,
          }),
        ),
      )
      variants.push({
        name: variant.name,
        color: variant.color,
        inStock: variant.inStock,
        price: 'price' in variant ? variant.price : undefined,
        images,
      })
    }

    await save(
      payload,
      'products',
      productId,
      product.slug,
      {
        category: categoryId,
        series: product.series,
        order: product.order,
        price: product.price,
        variants,
        _status: 'published',
      },
      {
        uk: { title: product.title, tags: product.tags.uk },
        ru: { title: product.title, tags: product.tags.ru },
      },
    )
  }

  payload.logger.info('Done')
}

await run()
process.exit(0)
