import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { RichText, richTextClassName } from './rich-text'

export type FaqItem = { question: string; answer: SerializedEditorState }

// Questions as native <details>: answers are always in the HTML (for search engines) and open without
// JavaScript. Questions are h3, so the list goes under an h2.
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn('divide-y divide-border border-y border-border', className)}>
      {items.map((item, i) => (
        <details key={`${i}-${item.question}`} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-semibold">{item.question}</h3>
            <ChevronDownIcon
              className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <RichText data={item.answer} headingTag="h4" className={cn('pb-5', richTextClassName)} />
        </details>
      ))}
    </div>
  )
}
