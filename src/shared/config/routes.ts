import type { Locale } from '@/shared/i18n'

// Paths of the pages that live in code (not in Payload), by language, without the locale prefix. The one
// place they are written: routes, links, the cart and the sitemap read them from here. Pages from Payload
// (articles, the FAQ) have their slugs in the admin instead.
export const routes = {
  // The current site's URL (/kontakty.html redirects here at cutover).
  contacts: { uk: '/kontakty', ru: '/kontakty' },
  checkout: { uk: '/oformlennia-zamovlennia', ru: '/oformlenie-zakaza' },
} as const satisfies Record<string, Record<Locale, string>>

export type RouteKey = keyof typeof routes

// The ones search engines index and the sitemap lists; the rest (checkout, cart, account) are noindex.
export const indexableRoutes: RouteKey[] = ['contacts']
