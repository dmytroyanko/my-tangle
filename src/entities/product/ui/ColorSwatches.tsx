'use client'

import { useTranslations } from 'next-intl'
import { useRef, type KeyboardEvent } from 'react'

import { Link } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import type { ProductVariant } from '../model/types'

type Size = 'sm' | 'lg'

// A swatch circle: an out-of-stock colour is faded and crossed out; a colour without a swatch colour shows a
// neutral circle.
const swatchClassName = (option: ProductVariant, current: boolean, size: Size) =>
  cn(
    'relative block rounded-full border border-black/10 bg-muted ring-offset-2 ring-offset-background transition-shadow',
    size === 'lg' ? 'size-8' : 'size-6 @2xs:size-7',
    current ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-border',
    !option.inStock &&
      'opacity-40 after:absolute after:top-1/2 after:left-1/2 after:h-px after:w-[130%] after:-translate-x-1/2 after:-rotate-45 after:bg-foreground',
  )

type Props = {
  variants: ProductVariant[]
  selected: number
  onSelect: (index: number) => void
  size?: Size
  className?: string
}

// Colour palette of a series card as a radio group: picking a colour switches the card; arrows move the
// selection and focus.
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
          className={swatchClassName(option, index === selected, size)}
          style={{ backgroundColor: option.color ?? undefined }}
        />
      ))}
    </div>
  )
}

// Colour palette of a product page: each colour is a link to its own page, the current one is marked.
export function ColorSwatchLinks({
  variants,
  selected,
  size = 'lg',
  className,
}: Omit<Props, 'onSelect'>) {
  const t = useTranslations('ProductCard')
  return (
    <ul aria-label={t('colour')} className={cn('flex flex-wrap gap-2', className)}>
      {variants.map((option, index) => (
        <li key={option.id}>
          <Link
            href={`/${option.slug}`}
            aria-current={index === selected ? 'page' : undefined}
            aria-label={option.inStock ? option.name : `${option.name}, ${t('outOfStock')}`}
            title={option.name}
            // The same page for every colour of the series: keep the scroll position.
            scroll={false}
            className={swatchClassName(option, index === selected, size)}
            style={{ backgroundColor: option.color ?? undefined }}
          />
        </li>
      ))}
    </ul>
  )
}
