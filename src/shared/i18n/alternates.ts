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

  // A page without its own path in this locale shows fallback content, so it is a duplicate of another
  // language version and points its canonical there: the Ukrainian one, or any that has a path.
  const canonical =
    languages[locale as Locale] ?? languages[routing.defaultLocale] ?? Object.values(languages)[0]
  // No path in any language (slugs not filled in yet): better no canonical than a failing page.
  if (!canonical) return undefined

  return { canonical, languages }
}
