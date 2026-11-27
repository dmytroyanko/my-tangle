import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Category } from '@/payload/payload-types'
import type { Locale } from '@/shared/i18n'

export type CatalogMenuItem = {
  id: number
  // Path without the locale.
  href: string
  title: string
  // Short name for the menu, in two lines.
  navTitle: string
  icon: NonNullable<Category['navIcon']>
}

// The catalog menu: top-level categories with a menu icon, in their admin order. The header, the footer and
// the 404 page link the catalog from here, so a slug renamed in the admin keeps every link. Cached per request.
export const getCatalogMenu = cache(async (locale: Locale): Promise<CatalogMenuItem[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false }, navIcon: { exists: true } },
    // Categories added in the admin default to order 0; creation date keeps their order stable.
    sort: ['order', 'createdAt'],
    locale,
    depth: 0,
    joins: false,
    pagination: false,
    select: { slug: true, title: true, navTitle: true, navIcon: true },
  })
  return docs.flatMap((doc) =>
    doc.slug && doc.navIcon
      ? [
          {
            id: doc.id,
            href: `/${doc.slug}`,
            title: doc.title,
            navTitle: doc.navTitle || doc.title,
            icon: doc.navIcon,
          },
        ]
      : [],
  )
})
