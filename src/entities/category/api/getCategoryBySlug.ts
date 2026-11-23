import { cache } from 'react'

import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'

import { toCategoryData } from './toCategoryData'

// Category texts in the given locale, looked up by slug with the Ukrainian fallback (see findBySlug).
// Cached per request, so a page and its metadata share one query.
export const getCategoryBySlug = cache(async (slug: string, locale: Locale) => {
  const found = await findBySlug({ collection: 'categories', slug, locale })
  if (!found) return null
  return toCategoryData(found.doc, found.slugs)
})

export type { CategoryData } from './toCategoryData'
