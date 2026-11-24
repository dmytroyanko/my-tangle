import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/shared/i18n'

// Published pages marked "show in the footer", in their footer order: the short title (or the title) and
// the path in the given language. The slug comes from the admin, so renaming it there keeps the link.
export const getFooterPages = cache(async (locale: Locale) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' }, showInFooter: { equals: true } },
    sort: ['footerOrder', 'createdAt'],
    locale,
    depth: 0,
    pagination: false,
    select: { title: true, navTitle: true, slug: true },
  })
  return docs.flatMap((page) =>
    page.slug ? [{ id: page.id, title: page.navTitle || page.title, href: `/${page.slug}` }] : [],
  )
})
