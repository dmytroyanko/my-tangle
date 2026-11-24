// Helpers shared by the seed scripts (catalog.ts, pages.ts): the light rich text markup used in their JSON,
// photo download and upload to Payload media, and saving a document in both languages.
import { createHash, randomBytes } from 'crypto'

import type { Payload } from 'payload'
import sharp from 'sharp'

export type Locale = 'uk' | 'ru'
export type Localized<T> = Record<Locale, T>

// A photo URL, or a part of a photo, optionally padded onto a larger canvas: a retailer photo, the brush
// alone from a packshot with its box (so the card preview matches the close-ups of other colours), or a
// manufacturer photo without its grey edge (Pet Teezer). `crop` is the area to keep in the downloaded photo
// (manufacturer photos come at most 1600px wide), `background` the canvas colour, which is lifted to white
// to match the manufacturer's photos, and `padding` the share of the width added around the photo when it
// fills the frame edge to edge.
type Crop = { left: number; top: number; width: number; height: number }
export type ImageSource =
  string | { url: string; crop: Crop; background?: string; padding?: number }

// Photos are stored as WebP, at most this many pixels on the long side. Next.js serves smaller sizes.
const MAX_IMAGE_SIZE = 1600
// Animations (GIF) are shown in the article column, at most this wide.
const ANIMATION_WIDTH = 640

export const UPDATE = process.env.SEED_UPDATE === '1'

// Lexical rich text from the light markup used in the JSON: blocks separated by a blank line, "## " and
// "### " headings, "- " bullet and "1. " numbered lists, an image block "![](media:<id>)" (an uploaded
// media document), and **bold** and [text](url) inside a line.
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

const list = (block: string, numbered: boolean) => ({
  ...common,
  type: 'list',
  listType: numbered ? 'number' : 'bullet',
  tag: numbered ? 'ol' : 'ul',
  start: 1,
  children: block.split('\n').map((item, i) => ({
    ...common,
    type: 'listitem',
    value: i + 1,
    children: inline(item.replace(numbered ? /^\d+\.\s+/ : /^- /, '')),
  })),
})

export const richText = (markup: string) => ({
  root: {
    ...common,
    type: 'root',
    children: markup.split('\n\n').map((block) => {
      const heading = block.match(/^(#{2,3}) ([\s\S]+)$/)
      if (heading)
        return {
          ...common,
          type: 'heading',
          tag: `h${heading[1].length}`,
          children: inline(heading[2]),
        }
      const image = block.match(/^!\[\]\(media:(\d+)\)$/)
      if (image)
        return {
          type: 'upload',
          version: 3,
          format: '',
          id: randomBytes(12).toString('hex'),
          fields: null,
          relationTo: 'media',
          value: Number(image[1]),
        }
      if (block.startsWith('- ')) return list(block, false)
      // Numbered only when every line is a step, so a paragraph starting with "2024. " stays a paragraph.
      if (block.split('\n').every((line) => /^\d+\.\s/.test(line))) return list(block, true)
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

  // An animated GIF (the cleaning how-tos) stays animated as WebP.
  const animated = /\.gif$/i.test(source.pathname)
  let pipeline = sharp(Buffer.from(await response.arrayBuffer()), { animated })
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
  // An animation keeps every frame, so it is made smaller than a photo (about 300 KB instead of 2 MB).
  const size = animated ? ANIMATION_WIDTH : MAX_IMAGE_SIZE
  return pipeline
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: animated ? 55 : 82, effort: animated ? 6 : 4 })
    .toBuffer()
}

// A photo in Payload media, uploaded once: matched by a file name that includes a hash of its source, so a
// changed URL in the JSON uploads the new photo.
export async function upsertMedia(
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

type SluggedCollection = 'categories' | 'products' | 'pages'

export async function findBySlug(
  payload: Payload,
  collection: SluggedCollection,
  slug: string,
  locale: Locale = 'uk',
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id
}

// Creates or updates a document: the Ukrainian version with the shared fields, then the Russian one.
export async function save(
  payload: Payload,
  collection: SluggedCollection,
  id: number | undefined,
  // One slug for both languages, or each language's own.
  slug: string | Localized<string>,
  shared: Record<string, unknown>,
  localized: Localized<Record<string, unknown>>,
) {
  const slugs = typeof slug === 'string' ? { uk: slug, ru: slug } : slug
  // generateSlug: false keeps the given slug; otherwise Payload makes the Russian one from the title.
  const ukData = { ...shared, ...localized.uk, slug: slugs.uk, generateSlug: false } as never
  const doc = id
    ? await payload.update({ collection, id, data: ukData, locale: 'uk' })
    : await payload.create({ collection, data: ukData, locale: 'uk' })
  await payload.update({
    collection,
    id: doc.id,
    data: { ...localized.ru, slug: slugs.ru, generateSlug: false } as never,
    locale: 'ru',
  })

  return doc.id
}
