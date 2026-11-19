import type { Slugify } from 'payload/shared'

// Ukrainian follows the official national transliteration (КМУ №55, 2010); Russian uses common web-style
// transliteration, so slugs read naturally in each language.
const common: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', д: 'd', е: 'e', ж: 'zh', з: 'z', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ю: 'iu',
  я: 'ia', ь: '', "'": '', '’': '', 'ʼ': '',
}

const uk: Record<string, string> = { ...common, г: 'h', ґ: 'g', и: 'y', і: 'i', ї: 'i', є: 'ie' }

const ru: Record<string, string> = {
  ...common, г: 'g', и: 'i', й: 'y', ё: 'e', ы: 'y', э: 'e', ъ: '', ю: 'yu', я: 'ya', х: 'h',
}

// At the start of a word the Ukrainian standard spells these differently (Їжак → Yizhak, Євген → Yevhen).
const ukWordStart: Record<string, string> = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' }

export function transliterate(value: string, locale?: string): string {
  const chars = [...value.toLowerCase()]

  if (locale === 'ru') return chars.map((char) => ru[char] ?? char).join('')

  return chars
    .map((char, i) => {
      const prev = chars[i - 1]
      if (!prev || !/\p{L}/u.test(prev)) return ukWordStart[char] ?? uk[char] ?? char
      // "зг" is written "zgh" so it is not read as "zh" (Згорани → Zghorany).
      if (char === 'г' && prev === 'з') return 'gh'
      return uk[char] ?? char
    })
    .join('')
}

export function toSlug(value: string, locale?: string): string {
  return transliterate(value, locale)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Payload slugField hook: builds the slug from the title in the language being edited.
export const slugify: Slugify = ({ req, valueToSlugify }) =>
  typeof valueToSlugify === 'string' ? toSlug(valueToSlugify, req.locale ?? undefined) : undefined
