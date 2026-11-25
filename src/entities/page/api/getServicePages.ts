import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/shared/i18n'

export type ServiceRole = 'offer' | 'privacy'

// Paths of the published pages with a service role (the offer, the privacy policy) in the given language,
// for the links next to the checkout button. A role no page has is left out.
export const getServicePages = cache(async (locale: Locale) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' }, serviceRole: { exists: true } },
    // A duplicated page keeps the role: the most recently updated one wins.
    sort: '-updatedAt',
    locale,
    depth: 0,
    pagination: false,
    select: { slug: true, serviceRole: true },
  })
  const paths: Partial<Record<ServiceRole, string>> = {}
  for (const page of docs)
    if (page.slug && page.serviceRole) paths[page.serviceRole] ??= `/${page.slug}`
  return paths
})
