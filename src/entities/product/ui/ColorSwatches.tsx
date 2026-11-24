'use client'

import { useTranslations } from 'next-intl'
import { useRef, type KeyboardEvent } from 'react'

import { cn } from '@/shared/lib/utils'

import type { ProductVariant } from '../model/types'

type Props = {
  variants: ProductVariant[]
  selected: number
  onSelect: (index: number) => void
  size?: 'sm' | 'lg'
  className?: string
}

// Colour palette as a radio group: arrows move the selection and focus. An out-of-stock colour is faded and
// crossed out; a colour without a swatch colour shows a neutral circle.
export function ColorSwatches({ variants, selected, onSelect, size = 'sm', className }: Props) {
  const t = useTranslations('ProductCard')
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!delta) return
    event.preventDefault()
    const next = (selected + delta + variants.length) % variants.length
    onSelect(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('colour')}
      onKeyDown={onKeyDown}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {variants.map((option, index) => (
        <button
          key={option.id}
          ref={(element) => {
            buttons.current[index] = element
          }}
          type="button"
          role="radio"
          aria-checked={index === selected}
          aria-label={option.inStock ? option.name : `${option.name}, ${t('outOfStock')}`}
          title={option.name}
          tabIndex={index === selected ? 0 : -1}
          onClick={() => onSelect(index)}
          className={cn(
            'relative rounded-full border border-black/10 bg-muted ring-offset-2 ring-offset-background transition-shadow',
            size === 'lg' ? 'size-8' : 'size-6 @2xs:size-7',
            index === selected ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-border',
            !option.inStock &&
              'opacity-40 after:absolute after:top-1/2 after:left-1/2 after:h-px after:w-[130%] after:-translate-x-1/2 after:-rotate-45 after:bg-foreground',
          )}
          style={{ backgroundColor: option.color ?? undefined }}
        />
      ))}
    </div>
  )
}
