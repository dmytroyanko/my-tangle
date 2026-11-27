import type { Metadata } from 'next'

import { siteName } from '@/shared/config'
import { alternates, type Locale } from '@/shared/i18n'

import type { ImageData } from './media'

// Metadata of an indexable page: title, description, canonical and hreflang, and the social preview.
export function pageMetadata({
  locale,
  paths,
  title,
  description,
  image,
  type,
}: {
  locale: Locale
  // The page's path in every language that has it, or one path shared by all.
  paths: string | Partial<Record<Locale, string>>
  title: string
  description?: string
  image?: ImageData | null
  // 'article' for information pages; the default is a website.
  type?: 'article'
}): Metadata {
  return {
    title,
    description,
    alternates: alternates(locale, paths),
    openGraph: {
      ...(type && { type }),
      title,
      description,
      siteName,
      images: image ? [image] : undefined,
    },
  }
}
