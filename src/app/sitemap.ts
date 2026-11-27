import type { MetadataRoute } from 'next'

import { getCategoryPaths } from '@/entities/category'
import { getPagePaths } from '@/entities/page'
import { getProductPaths } from '@/entities/product'
import { indexableRoutes, routes } from '@/shared/config'
import { absoluteUrl, routing, type Locale } from '@/shared/i18n'

// Read from Payload on every request: the build has no database, and new products appear at once.
export const dynamic = 'force-dynamic'

type Slugs = Partial<Record<Locale, string | null>>

// One entry per language version, each listing all versions (hreflang) and x-default (Ukrainian). A
// language without its own path (no slug in that language) is left out.
function entries(
  paths: Partial<Record<Locale, string>>,
  lastModified?: string,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(paths).map(([locale, href]) => [locale, absoluteUrl(locale as Locale, href)]),
  )
  const xDefault = languages[routing.defaultLocale]
  return Object.values(languages).map((url) => ({
    url,
    lastModified,
    alternates: { languages: { ...languages, ...(xDefault && { 'x-default': xDefault }) } },
  }))
}

// Path per language from slugs, e.g. { uk: '/yak-myty-tangle-teezer', ru: '/kak-myt-tangle-teezer' }.
const pathsOf = (toPath: (locale: Locale) => string | null) =>
  Object.fromEntries(
    routing.locales.flatMap((locale) => {
      const path = toPath(locale)
      return path ? [[locale, path]] : []
    }),
  ) as Partial<Record<Locale, string>>

const slugPath = (slugs: Slugs) => (locale: Locale) => (slugs[locale] ? `/${slugs[locale]}` : null)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, pages] = await Promise.all([
    getCategoryPaths(),
    getProductPaths(),
    getPagePaths(),
  ])
  const all = (href: string) => pathsOf(() => href)
  const taken = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      new Set(categories.map((category) => category.slugs[locale]).filter(Boolean)),
    ]),
  ) as Record<Locale, Set<string | null | undefined>>
  const takenByProducts = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      new Set(products.map((product) => product.slugs[locale]).filter(Boolean)),
    ]),
  ) as Record<Locale, Set<string | null | undefined>>

  return [
    ...entries(all('/')),
    ...categories.flatMap((category) =>
      entries(pathsOf(slugPath(category.slugs)), category.updatedAt),
    ),
    // A category wins a slug both use (see the /[slug] route), so such a product has no address of its own.
    ...products.flatMap((product) =>
      entries(
        pathsOf((locale) =>
          taken[locale].has(product.slugs[locale] ?? '') ? null : slugPath(product.slugs)(locale),
        ),
        product.updatedAt,
      ),
    ),
    // A category or product wins a slug a page also uses (see the /[slug] route), so such a page has no
    // address of its own.
    ...pages.flatMap((page) =>
      entries(
        pathsOf((locale) =>
          taken[locale].has(page.slugs[locale] ?? '') ||
          takenByProducts[locale].has(page.slugs[locale] ?? '')
            ? null
            : slugPath(page.slugs)(locale),
        ),
        page.updatedAt,
      ),
    ),
    // Pages from code, each language at its own path.
    ...indexableRoutes.flatMap((key) => entries(routes[key])),
  ]
}
