import { cache } from 'react'

import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'

import { toCategoryData } from './toCategoryData'

// Category texts in the given locale, looked up by slug, also by another language's slug as `otherLocales`
// says (see findBySlug). Cached per request, so a page and its metadata share one query.
export const getCategoryBySlug = cache(
  async (slug: string, locale: Locale, otherLocales: boolean | 'only' = true) => {
    const found = await findBySlug({ collection: 'categories', slug, locale, otherLocales })
    if (!found) return null
    return toCategoryData(found.doc, found.slugs)
  },
)

export type { CategoryData } from './toCategoryData'
