import createMiddleware from 'next-intl/middleware'

// Imported directly rather than via the public API so the proxy bundle stays small.
import { routing } from './shared/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip the Payload admin and API, Next internals and static files.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
