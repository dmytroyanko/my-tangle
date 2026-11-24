import type { MetadataRoute } from 'next'

import { getCategoryPaths } from '@/entities/category'
import { getPagePaths } from '@/entities/page'
import { getProductPaths } from '@/entities/product'
import { indexableRoutes, routes, siteUrl } from '@/shared/config'
import { getPathname, routing, type Locale } from '@/shared/i18n'

// Read from Payload on every request: the build has no database, and new products appear at once.
export const dynamic = 'force-dynamic'

type Slugs = Partial<Record<Locale, string | null>>

const absolute = (locale: Locale, href: string) =>
  new URL(getPathname({ locale, href }), siteUrl).href

// One entry per language version, each listing all versions (hreflang) and x-default (Ukrainian). A
// language without its own path (no slug in that language) is left out.
function entries(
  paths: Partial<Record<Locale, string>>,
  lastModified?: string,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(paths).map(([locale, href]) => [locale, absolute(locale as Locale, href)]),
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

  return [
    ...entries(all('/')),
    ...categories.flatMap((category) =>
      entries(pathsOf(slugPath(category.slugs)), category.updatedAt),
    ),
    ...products.flatMap((product) =>
      entries(
        pathsOf((locale) => {
          const category = product.categorySlugs[locale]
          const slug = product.slugs[locale]
          return category && slug ? `/${category}/${slug}` : null
        }),
        product.updatedAt,
      ),
    ),
    // A category wins a slug both use (see the /[slug] route), so such a page has no address of its own.
    ...pages.flatMap((page) =>
      entries(
        pathsOf((locale) =>
          taken[locale].has(page.slugs[locale] ?? '') ? null : slugPath(page.slugs)(locale),
        ),
        page.updatedAt,
      ),
    ),
    // Pages from code, each language at its own path.
    ...indexableRoutes.flatMap((key) => entries(routes[key])),
  ]
}
