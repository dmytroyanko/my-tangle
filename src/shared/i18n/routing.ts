import { defineRouting } from 'next-intl/routing'

// Ukrainian is the main language and lives at the root (/), Russian under /ru.
export const routing = defineRouting({
  locales: ['uk', 'ru'],
  defaultLocale: 'uk',
  localePrefix: 'as-needed',
  // Always serve the language from the URL; never redirect by browser language or cookie.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
