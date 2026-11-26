import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/shared/i18n'
import type { FaqItem } from '@/shared/ui/faq-list'

// The home page questions (global "home-page") in the given language.
export async function getHomeFaq(locale: Locale): Promise<FaqItem[]> {
  const payload = await getPayload({ config })
  const home = await payload.findGlobal({ slug: 'home-page', locale, depth: 0 })
  return (home.faq ?? []).map((item) => ({ question: item.question, answer: item.answer }))
}
