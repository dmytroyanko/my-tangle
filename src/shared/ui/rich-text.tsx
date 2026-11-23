import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { Link, routing } from '@/shared/i18n'
import { externalLinkProps, isExternalUrl } from '@/shared/lib/links'

type Props = {
  data: SerializedEditorState
  // Level for headings inside the text, whatever level they were saved at: one below the block title.
  headingTag?: 'h3' | 'h4'
  className?: string
}

type LinkedDoc = { relationTo?: string; value?: unknown }

// Path of a document picked with the editor's "internal link" (populated at depth 1 or more). Categories
// and pages live at /<slug>, a product under its category; anything else has no page.
function internalHref(doc: LinkedDoc | null | undefined) {
  const value = doc?.value as { slug?: string; category?: unknown } | undefined
  if (!value?.slug) return ''
  switch (doc?.relationTo) {
    case 'categories':
    case 'pages':
      return `/${value.slug}`
    case 'products': {
      const category = value.category as { slug?: string } | undefined
      return category?.slug ? `/${category.slug}/${value.slug}` : ''
    }
    default:
      return ''
  }
}

const hasLocalePrefix = (path: string) =>
  routing.locales.some((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`))

// Payload rich text with the site's rules: links to other websites get nofollow/noreferrer and open in
// a new tab; links within the site keep the current language; headings follow the surrounding outline.
export function RichText({ data, headingTag = 'h3', className }: Props) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = headingTag
      return <Tag>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const href =
        node.fields?.linkType === 'internal' ? internalHref(node.fields.doc) : (node.fields?.url ?? '')
      // A link to a document that has no page (yet) is shown as plain text, not as a link to nowhere.
      if (!href) return <>{children}</>
      if (isExternalUrl(href))
        return (
          <a href={href} {...externalLinkProps}>
            {children}
          </a>
        )
      const newTab = node.fields?.newTab ? ({ target: '_blank', rel: 'noopener' } as const) : {}
      // Site paths get the language prefix of the current page (/ru/...), like every internal link. A path
      // an editor typed with the prefix already (/ru/...) is used as is.
      if (href.startsWith('/') && !hasLocalePrefix(href))
        return (
          <Link href={href} {...newTab}>
            {children}
          </Link>
        )
      return (
        <a href={href} {...newTab}>
          {children}
        </a>
      )
    },
  })

  return <PayloadRichText data={data} converters={converters} className={className} />
}

// Typography for rich text blocks (description, FAQ answers).
export const richTextClassName =
  'space-y-3 text-base text-foreground/80 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-foreground [&_h3,&_h4]:pt-3 [&_h3,&_h4]:text-lg [&_h3,&_h4]:leading-snug [&_h3,&_h4]:font-semibold [&_h3,&_h4]:text-foreground [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5'
