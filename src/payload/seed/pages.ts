// Imports information pages (articles) from the JSON files in ./pages, one file per page:
//   pnpm payload run src/payload/seed/pages.ts                           (every page)
//   PAGE=kak-myt-tangle-teezer pnpm payload run src/payload/seed/pages.ts (one page)
// Texts follow the manufacturer's, adapted for the shop; slugs are the current site's (without .html).
// Service pages (delivery, offer, privacy, returns) are the shop's own texts.
//
// Safe to run again: a page that already exists (matched by slug) is left as edited in the admin unless
// SEED_UPDATE=1. Photos are matched by file name, as in catalog.ts.
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

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

// One page file. `content` uses the light markup of richText() in ./lib.ts; a photo is written as a block
// "![](image:<key>)" with the key of one of `images`.
type PageFile = {
  // Ukrainian (KMU transliteration of the Ukrainian title) and Russian (the current site's URL).
  slug: Localized<string>
  title: Localized<string>
  // Short title for the footer link; when set with footerOrder, the page is listed in the footer.
  navTitle?: Localized<string>
  footerOrder?: number
  // The offer or the privacy policy, linked from the checkout.
  serviceRole?: 'offer' | 'privacy'
  meta: { title: Localized<string>; description: Localized<string> }
  images?: { key: string; url: ImageSource; alt: Localized<string> }[]
  // Key of the photo for social previews and structured data.
  metaImage?: string
  content: Localized<string>
  // Questions under the text, by topic; answers use the same markup as `content`.
  faq?: Localized<{ title: string; items: { question: string; answer: string }[] }[]>
}

const PAGES_DIR = seedPath(import.meta.url, 'pages')

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

  await save(
    payload,
    'pages',
    id,
    page.slug,
    {
      _status: 'published',
      showInFooter: page.footerOrder !== undefined,
      footerOrder: page.footerOrder ?? 0,
      serviceRole: page.serviceRole ?? null,
    },
    byLocale((locale) => ({
      title: page.title[locale],
      navTitle: page.navTitle?.[locale],
      content: content(page.content[locale]),
      faq: (page.faq?.[locale] ?? []).map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          question: item.question,
          answer: content(item.answer),
        })),
      })),
      meta: { title: page.meta.title[locale], description: page.meta.description[locale], image },
    })),
  )
  payload.logger.info(`${page.slug.uk}: saved`)
}

const files = readSeedFiles<PageFile>(PAGES_DIR, process.env.PAGE)
const payload = await getPayload({ config })
for (const data of files) await importPage(payload, data)
payload.logger.info('Done')
process.exit(0)
