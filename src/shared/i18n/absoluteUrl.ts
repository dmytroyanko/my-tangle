import { siteUrl } from '@/shared/config'

import { getPathname } from './navigation'
import type { Locale } from './routing'

// Full address of a site path in a language, for structured data and the sitemap: /kontakty in ru gives
// https://my-tangle.com.ua/ru/kontakty.
export const absoluteUrl = (locale: Locale, href: string) =>
  new URL(getPathname({ locale, href }), siteUrl).href
