// Imports information pages (articles) from the JSON files in ./pages, one file per page:
//   pnpm payload run src/payload/seed/pages.ts                           (every page)
//   PAGE=kak-myt-tangle-teezer pnpm payload run src/payload/seed/pages.ts (one page)
// Texts follow the manufacturer's, adapted for the shop; slugs are the current site's (without .html).
//
// Safe to run again: a page that already exists (matched by slug) is left as edited in the admin unless
// SEED_UPDATE=1. Photos are matched by file name, as in catalog.ts.
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import {
  findBySlug,
  type ImageSource,
  type Localized,
  richText,
  save,
  UPDATE,
  upsertMedia,
} from './lib'

// One page file. `content` uses the light markup of richText() in ./lib.ts; a photo is written as a block
// "![](image:<key>)" with the key of one of `images`.
type PageFile = {
  // Ukrainian (KMU transliteration of the Ukrainian title) and Russian (the current site's URL).
  slug: Localized<string>
  title: Localized<string>
  meta: { title: Localized<string>; description: Localized<string> }
  images?: { key: string; url: ImageSource; alt: Localized<string> }[]
  // Key of the photo for social previews and structured data.
  metaImage?: string
  content: Localized<string>
  // Questions under the text, by topic; answers use the same markup as `content`.
  faq?: Localized<{ title: string; items: { question: string; answer: string }[] }[]>
}

const PAGES_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'pages')

async function importPage(payload: Payload, page: PageFile) {
  // Also matched by the Russian slug, for a page saved before it had a Ukrainian one.
  const id =
    (await findBySlug(payload, 'pages', page.slug.uk)) ??
    (await findBySlug(payload, 'pages', page.slug.ru, 'ru'))
  if (id && !UPDATE) {
    payload.logger.info(`${page.slug.uk}: exists, skipped`)
    return
  }

  const media: Record<string, number> = {}
  for (const image of page.images ?? []) {
    media[image.key] = await upsertMedia(
      payload,
      image.url,
      // The Russian slug, the page's first one, so the photos are not uploaded again.
      `page-${page.slug.ru}-${image.key}`,
      image.alt,
    )
  }
  const content = (markup: string) =>
    richText(
      markup.replace(/!\[\]\(image:([\w-]+)\)/g, (_, key: string) => {
        if (!media[key]) throw new Error(`${page.slug.uk}: no image "${key}"`)
        return `![](media:${media[key]})`
      }),
    )

  // The meta group mixes translated fields with the shared image, so the image goes into both languages.
  if (page.metaImage && !media[page.metaImage])
    throw new Error(`${page.slug.uk}: no image "${page.metaImage}" for metaImage`)
  const image = page.metaImage ? media[page.metaImage] : undefined
  const faq = (locale: 'uk' | 'ru') =>
    (page.faq?.[locale] ?? []).map((group) => ({
      title: group.title,
      items: group.items.map((item) => ({ question: item.question, answer: content(item.answer) })),
    }))
  const meta = (locale: 'uk' | 'ru') => ({
    title: page.meta.title[locale],
    description: page.meta.description[locale],
  })

  await save(
    payload,
    'pages',
    id,
    page.slug,
    { _status: 'published' },
    {
      uk: {
        title: page.title.uk,
        content: content(page.content.uk),
        faq: faq('uk'),
        meta: { ...meta('uk'), image },
      },
      ru: {
        title: page.title.ru,
        content: content(page.content.ru),
        faq: faq('ru'),
        meta: { ...meta('ru'), image },
      },
    },
  )
  payload.logger.info(`${page.slug.uk}: saved`)
}

const only = process.env.PAGE
const files = readdirSync(PAGES_DIR)
  .filter((file) => file.endsWith('.json') && (!only || file === `${only}.json`))
  .sort()
if (!files.length) throw new Error(`No page file for PAGE=${only}`)

const payload = await getPayload({ config })
for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(PAGES_DIR, file), 'utf8')) as PageFile
  await importPage(payload, data)
}
payload.logger.info('Done')
process.exit(0)
