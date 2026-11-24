import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Image from 'next/image'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { Link, routing } from '@/shared/i18n'
import { externalLinkProps, isExternalUrl } from '@/shared/lib/links'
import { toImage } from '@/shared/lib/media'

type Props = {
  data: SerializedEditorState
  // Level for headings inside the text, whatever level they were saved at: one below the block title.
  // 'as-saved' keeps the editor's levels, for a page whose own title is the h1 (an article); a Heading 1
  // in the text becomes an h2, so the page keeps a single h1.
  headingTag?: 'h3' | 'h4' | 'as-saved'
  className?: string
}

type LinkedDoc = { relationTo?: string; value?: unknown }

// Path of a document picked with the editor's "internal link" (a product link needs depth 2, for its
// category). Categories and pages live at /<slug>, a product under its category; anything else has no page.
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
      const Tag = headingTag !== 'as-saved' ? headingTag : node.tag === 'h1' ? 'h2' : node.tag
      return <Tag>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    // Photos from the media library, resized by Next.js; the text column is at most 768px wide.
    upload: ({ node }) => {
      const image = toImage(node.value as Parameters<typeof toImage>[0])
      if (!image) return null
      return (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width}
          height={image.height}
          // Next.js serves an animated WebP (the cleaning how-tos) as is.
          sizes="(min-width: 768px) 768px, 100vw"
          className="h-auto w-full rounded-lg"
        />
      )
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

// Typography for an article: the page title is the h1, so the text has h2 and h3 sections, numbered steps
// and photos.
export const articleClassName =
  'space-y-4 text-base leading-relaxed text-foreground/80 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-foreground [&_h2]:pt-6 [&_h2]:text-xl [&_h2]:leading-snug [&_h2]:font-semibold [&_h2]:text-foreground md:[&_h2]:text-2xl [&_h3]:pt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_img]:my-6 [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5'
