import type { Metadata } from 'next'

import { getPathname } from './navigation'
import { routing, type Locale } from './routing'

// Canonical URL plus hreflang links for every language version of a page.
// `paths` gives the path per locale when slugs differ between languages; a single string is shared by all.
export function alternates(
  locale: string,
  paths: string | Partial<Record<Locale, string>>,
): Metadata['alternates'] {
  const pathFor = (l: Locale) => (typeof paths === 'string' ? paths : paths[l])
  const languages: Record<string, string> = {}

  for (const l of routing.locales) {
    const href = pathFor(l)
    if (href) languages[l] = getPathname({ locale: l, href })
  }
  if (languages[routing.defaultLocale]) languages['x-default'] = languages[routing.defaultLocale]

  // A page without its own path in this locale shows the Ukrainian fallback content, so it is a duplicate
  // of the Ukrainian page and points its canonical there.
  const canonical = languages[locale as Locale] ?? languages[routing.defaultLocale]
  if (!canonical) throw new Error(`alternates(): no path for "${locale}" or the default locale`)

  return { canonical, languages }
}
