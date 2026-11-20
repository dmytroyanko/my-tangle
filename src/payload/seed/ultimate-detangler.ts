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
  const ukData = { ...shared, ...localized.uk, slug } as never
  const doc = id
    ? await payload.update({ collection, id, data: ukData, locale: 'uk' })
    : await payload.create({ collection, data: ukData, locale: 'uk' })
  await payload.update({
    collection,
    id: doc.id,
    data: { ...localized.ru, slug } as never,
    locale: 'ru',
  })

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
    const categoryImage = await upsertMedia(
      payload,
      category.image,
      'ud-category',
      category.imageAlt,
    )
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
          description: richText(category.description.uk),
          meta: { title: category.meta.title.uk, description: category.meta.description.uk },
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
      const name = `${product.slug}-${toSlug(variant.name, 'uk')}`
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
