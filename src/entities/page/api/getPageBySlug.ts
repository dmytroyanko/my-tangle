import { cache } from 'react'

import { findBySlug } from '@/payload/lib/findBySlug'
import type { Locale } from '@/shared/i18n'
import { toImage } from '@/shared/lib/media'
import { toPlainText } from '@/shared/lib/plain-text'

// Length of the description made from the text when the page has no SEO description of its own.
const EXCERPT_LENGTH = 160

// The start of a text, cut at a word and ended with an ellipsis when it is longer than `length`.
function excerpt(text: string, length: number) {
  if (text.length <= length) return text
  const cut = text.slice(0, length)
  // At the last word break, or mid-word when the start has none (a long link).
  const space = cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,.;:—–-]+$/, '')}…`
}

// A published information page (an article, delivery terms) in the given locale, looked up by slug, also
// by another language's slug as `otherLocales` says (see findBySlug). Cached per request, so the
// page and its metadata share one query.
export const getPageBySlug = cache(
  async (slug: string, locale: Locale, otherLocales: boolean | 'only' = true) => {
    const found = await findBySlug({
      collection: 'pages',
      slug,
      locale,
      where: { _status: { equals: 'published' } },
      otherLocales,
    })
    if (!found) return null
    const { doc: page, slugs } = found
    const text = page.content ? toPlainText(page.content) : ''

    return {
      id: page.id,
      title: page.title,
      content: page.content ?? null,
      // Questions under the text, by topic; the plain-text answer is for structured data.
      faq: (page.faq ?? []).map((group) => ({
        title: group.title,
        items: (group.items ?? []).map((item) => ({
          question: item.question,
          answer: item.answer,
          answerText: toPlainText(item.answer),
        })),
      })),
      updatedAt: page.updatedAt,
      slugs,
      meta: {
        title: page.meta?.title || null,
        // An editor's SEO description, else the start of the text.
        description: page.meta?.description || (text ? excerpt(text, EXCERPT_LENGTH) : null),
        image: toImage(page.meta?.image),
      },
    }
  },
)

export type PageData = NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>
