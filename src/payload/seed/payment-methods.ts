// Imports the payment methods from ./payment-methods.json, in the file's order:
//   pnpm payload run src/payload/seed/payment-methods.ts
// Safe to run again: a method that exists (matched by its Ukrainian name) is left as edited in the admin
// unless SEED_UPDATE=1. Apple Pay / Google Pay is switched off until the payment provider is connected.
import { readFileSync } from 'fs'

import config from '@payload-config'
import { getPayload } from 'payload'

import { type Localized, seedPath, UPDATE } from './lib'

type MethodFile = { title: Localized<string>; note: Localized<string>; enabled: boolean }[]

const methods = JSON.parse(
  readFileSync(seedPath(import.meta.url, 'payment-methods.json'), 'utf8'),
) as MethodFile

const payload = await getPayload({ config })
for (const [order, method] of methods.entries()) {
  const { docs } = await payload.find({
    collection: 'payment-methods',
    where: { title: { equals: method.title.uk } },
    locale: 'uk',
    depth: 0,
    limit: 1,
  })
  let id = docs[0]?.id
  if (id && !UPDATE) {
    payload.logger.info(`${method.title.uk}: exists, skipped`)
    continue
  }
  for (const locale of ['uk', 'ru'] as const) {
    const data = {
      title: method.title[locale],
      note: method.note[locale],
      enabled: method.enabled,
      order,
    }
    id = id
      ? (await payload.update({ collection: 'payment-methods', id, data, locale })).id
      : (await payload.create({ collection: 'payment-methods', data, locale })).id
  }
  payload.logger.info(`${method.title.uk}: saved`)
}
process.exit(0)
