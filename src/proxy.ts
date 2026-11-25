import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Imported directly rather than via the public API so the proxy bundle stays small.
import { routeFolder, routes, type RouteKey } from './shared/config/routes'
import { routing, type Locale } from './shared/i18n/routing'

const intl = createMiddleware(routing)
const keys = Object.keys(routes) as RouteKey[]

const withPrefix = (locale: Locale, path: string) =>
  locale === routing.defaultLocale ? path : `/${locale}${path}`

// Pages in code whose path differs by language (checkout) are served from one folder named after the key:
// each language's path is rewritten to it, the other language's path redirects to this language's one
// (the language switcher links there), and the folder's own path is not a page.
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const prefixed = routing.locales.find(
    (l) => l !== routing.defaultLocale && (pathname === `/${l}` || pathname.startsWith(`/${l}/`)),
  )
  const locale: Locale = prefixed ?? routing.defaultLocale
  const path = prefixed ? pathname.slice(prefixed.length + 1) || '/' : pathname

  for (const key of keys) {
    const folder = routeFolder(key)
    if (folder === routes[key].uk) continue
    const url = request.nextUrl.clone()
    if (path === routes[key][locale]) {
      url.pathname = `/${locale}${folder}`
      return NextResponse.rewrite(url)
    }
    if (routing.locales.some((l) => routes[key][l] === path)) {
      url.pathname = withPrefix(locale, routes[key][locale])
      return NextResponse.redirect(url)
    }
    if (path === folder) {
      // Any path no page has: the [slug] route answers with the site's 404.
      url.pathname = `/${locale}/_not-found${folder}`
      return NextResponse.rewrite(url)
    }
  }
  return intl(request)
}

export const config = {
  // Skip the Payload admin and API, Next internals and static files.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
