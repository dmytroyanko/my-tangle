// Lists media files that no product, category or page uses, and deletes them:
//   pnpm payload run src/payload/seed/cleanup-media.ts                   (list only)
//   CLEANUP_APPLY=1 pnpm payload run src/payload/seed/cleanup-media.ts   (delete)
// A file counts as used when a document references it in either language, in its published version, its
// draft or any saved version, as an upload field or inside rich text. Deleting removes the file from
// storage too and cannot be undone.
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const apply = process.env.CLEANUP_APPLY === '1'

const used = new Set<number>()
// Upload fields hold an id (depth 0); rich text upload nodes hold { relationTo: 'media', value }.
// Scanning the whole document finds both, wherever the field sits.
const collect = (value: unknown, key?: string): void => {
  if (Array.isArray(value)) return value.forEach((item) => collect(item, key))
  if (value && typeof value === 'object') {
    const node = value as Record<string, unknown>
    if (node.relationTo === 'media') collect(node.value, 'image')
    for (const [childKey, child] of Object.entries(node)) collect(child, childKey)
    return
  }
  if (typeof value === 'number' && key && /^(image|images)$/.test(key)) used.add(value)
}

// Published documents, their latest drafts, and every saved version (the live site may show the published
// version while a newer draft has other photos; a version restored from history needs its photos too).
for (const collection of ['products', 'categories', 'pages'] as const) {
  for (const locale of ['uk', 'ru'] as const) {
    for (const draft of [false, true]) {
      const { docs } = await payload.find({
        collection,
        locale,
        draft,
        depth: 0,
        pagination: false,
      })
      collect(docs)
    }
  }
}
for (const collection of ['products', 'pages'] as const) {
  for (const locale of ['uk', 'ru'] as const) {
    const { docs } = await payload.findVersions({ collection, locale, depth: 0, pagination: false })
    collect(docs)
  }
}

const { docs: media } = await payload.find({ collection: 'media', depth: 0, pagination: false })
const unused = media.filter((doc) => !used.has(doc.id))
payload.logger.info(`media ${media.length}, used ${used.size}, unused ${unused.length}`)
for (const doc of unused) payload.logger.info(`  ${doc.id} ${doc.filename}`)

if (apply) {
  for (const doc of unused) await payload.delete({ collection: 'media', id: doc.id })
  payload.logger.info(`deleted ${unused.length}`)
}
process.exit(0)
