import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { externalLinkProps, isExternalUrl } from '@/shared/lib/links'

type Props = {
  data: SerializedEditorState
  // Level for headings inside the text, whatever level they were saved at: one below the block title.
  headingTag?: 'h3' | 'h4'
  className?: string
}

// Payload rich text with the site's rules: links to other websites get nofollow/noreferrer and open in
// a new tab; headings follow the surrounding outline.
export function RichText({ data, headingTag = 'h3', className }: Props) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = headingTag
      return <Tag>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    link: ({ node, nodesToJSX }) => {
      const url: string = node.fields?.url ?? ''
      return (
        <a href={url} {...(isExternalUrl(url) ? externalLinkProps : {})}>
          {nodesToJSX({ nodes: node.children })}
        </a>
      )
    },
  })

  return <PayloadRichText data={data} converters={converters} className={className} />
}

// Typography for rich text blocks (description, FAQ answers).
export const richTextClassName =
  'space-y-3 text-base text-foreground/80 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-foreground [&_h3,&_h4]:pt-3 [&_h3,&_h4]:text-lg [&_h3,&_h4]:leading-snug [&_h3,&_h4]:font-semibold [&_h3,&_h4]:text-foreground [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5'
