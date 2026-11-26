// Imports the home page questions (global "home-page") from ./home.json:
//   pnpm payload run src/payload/seed/home.ts
// Safe to run again: questions already there (edited in the admin) are kept unless SEED_UPDATE=1.
import { readFileSync } from 'fs'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type Localized, richText, seedPath, UPDATE } from './lib'

type FaqItem = { question: string; answer: string }
type HomeFile = { faq: Localized<FaqItem[]> }

const data = JSON.parse(readFileSync(seedPath(import.meta.url, 'home.json'), 'utf8')) as HomeFile

const payload = await getPayload({ config })
// Kept if either language already has questions, so an editor's translation is never overwritten.
const filled = await Promise.all(
  (['uk', 'ru'] as const).map(async (locale) => {
    const home = await payload.findGlobal({
      slug: 'home-page',
      locale,
      depth: 0,
      fallbackLocale: false,
    })
    return Boolean(home.faq?.length)
  }),
)
if (filled.some(Boolean) && !UPDATE) {
  payload.logger.info('home-page: has questions, skipped')
} else {
  for (const locale of ['uk', 'ru'] as const)
    await payload.updateGlobal({
      slug: 'home-page',
      locale,
      data: {
        faq: data.faq[locale].map((item) => ({
          question: item.question,
          answer: richText(item.answer),
        })),
      },
    })
  payload.logger.info('home-page: saved')
}
process.exit(0)
