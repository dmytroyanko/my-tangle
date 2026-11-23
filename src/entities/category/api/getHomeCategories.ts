import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'

import { toCategoryData } from './toCategoryData'

// Categories marked "show on the home page" in the admin, in their menu order. The slug comes in the
// requested locale (Payload falls back to the Ukrainian one), which is all the home page links need.
export async function getHomeCategories(locale: Locale) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { showOnHome: { equals: true } },
    sort: 'order',
    locale,
    depth: 1,
    pagination: false,
  })
  return docs.map((category) => toCategoryData(category, { [locale]: category.slug }))
}
