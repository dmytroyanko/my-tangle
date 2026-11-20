'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import type { ProductCardData } from '../model/types'
import { ProductGallery } from './ProductGallery'

// One series with its colours: picking a swatch switches the photo, price and availability;
// the photo opens the gallery of that colour. Sizes follow the card's container (@container on the parent).
// A colour without a swatch colour shows a neutral circle.
export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const t = useTranslations('ProductCard')
  const firstInStock = product.variants.findIndex((variant) => variant.inStock)
  const [selected, setSelected] = useState(Math.max(firstInStock, 0))
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const swatches = useRef<(HTMLButtonElement | null)[]>([])

  const variant = product.variants[selected]
  if (!variant) return null
  const image = variant.images[0]
  const fullName = `${product.title} ${variant.name}`

  const select = (index: number) => {
    setSelected(index)
    setGalleryIndex(0)
  }

  // Radio group keyboard behaviour: arrows move the selection and focus.
  const onSwatchKeyDown = (event: KeyboardEvent) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!delta) return
    event.preventDefault()
    const next = (selected + delta + product.variants.length) % product.variants.length
    select(next)
    swatches.current[next]?.focus()
  }

  return (
    <article className="flex h-full flex-col">
      {product.series && (
        <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          {product.series}
        </p>
      )}

      <button
        type="button"
        onClick={() => setGalleryOpen(true)}
        disabled={!image}
        aria-label={t('openGallery', { name: fullName })}
        className="group relative block aspect-square overflow-hidden rounded-lg bg-white"
      >
        {image && (
          <Image
            key={image.url}
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw"
            loading={priority ? 'eager' : undefined}
            fetchPriority={priority ? 'high' : undefined}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </button>

      <h3 className="mt-3 text-sm leading-snug font-semibold @2xs:text-base">{product.title}</h3>

      {product.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {product.tags.map((tag, i) => (
            <li key={`${i}-${tag}`} className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div role="radiogroup" aria-label={t('colour')} onKeyDown={onSwatchKeyDown} className="mt-3 flex flex-wrap gap-2">
        {product.variants.map((option, index) => (
          <button
            key={option.id}
            ref={(element) => {
              swatches.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={index === selected}
            aria-label={option.inStock ? option.name : `${option.name}, ${t('outOfStock')}`}
            title={option.name}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => select(index)}
            className={cn(
              'relative size-6 rounded-full border border-black/10 bg-muted ring-offset-2 ring-offset-background transition-shadow @2xs:size-7',
              index === selected ? 'ring-2 ring-foreground' : 'hover:ring-2 hover:ring-border',
              !option.inStock &&
                'opacity-40 after:absolute after:top-1/2 after:left-1/2 after:h-px after:w-[130%] after:-translate-x-1/2 after:-rotate-45 after:bg-foreground',
            )}
            style={{ backgroundColor: option.color ?? undefined }}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {t('colour')}: <span className="font-semibold text-foreground">{variant.name}</span>
        {!variant.inStock && <span> · {t('outOfStock')}</span>}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <p className="text-lg font-bold">{t('price', { price: variant.price })}</p>
        {/* Buying is not wired yet: the button is a placeholder until the cart exists. */}
        <Button type="button" disabled={!variant.inStock} className="w-full rounded-full px-6 @2xs:w-auto">
          {variant.inStock ? t('buy') : t('outOfStock')}
        </Button>
      </div>

      <ProductGallery
        title={fullName}
        images={variant.images}
        index={galleryIndex}
        onIndexChange={setGalleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </article>
  )
}
