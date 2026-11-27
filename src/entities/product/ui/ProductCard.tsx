'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

import { Link } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import { defaultVariantIndex, hasPalette } from '../model/defaultVariant'
import { SelectedVariantContext } from '../model/selectedVariant'
import type { ProductCardData } from '../model/types'
import { ColorSwatches } from './ColorSwatches'
import { ProductPrice } from './ProductPrice'

type Props = {
  product: ProductCardData
  priority?: boolean
  // The buy button, shown for a colour in stock; it reads the picked colour from SelectedVariantContext.
  buy?: ReactNode
  // One colour only (the colours-as-cards list): no palette, and the colour name is part of the title.
  variantIndex?: number
}

// One series with its colours: picking a swatch switches the photo, price and availability; the photo and
// title open the page of that colour. With `variantIndex` the card is that one colour. Sizes follow the
// card's container (@container on the parent).
export function ProductCard({ product, priority = false, buy, variantIndex }: Props) {
  const t = useTranslations('ProductCard')
  const [picked, setPicked] = useState(() => defaultVariantIndex(product.variants))
  const selected = variantIndex ?? picked
  const single = variantIndex !== undefined

  const variant = product.variants[selected]
  if (!variant) return null
  const image = variant.images[0]
  const link = `/${variant.slug}`
  // A colour that cannot be bought is shown muted: photo, title and price; the palette stays clear, so
  // another colour can be picked.
  const muted = !variant.inStock && 'opacity-60'

  return (
    <article className="flex h-full flex-col">
      {product.series && (
        <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
          {product.series}
        </p>
      )}

      {/* The title link below is the one for keyboards and screen readers; the photo repeats it for the mouse. */}
      <Link
        href={link}
        tabIndex={-1}
        aria-hidden="true"
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
            className={cn(
              'object-contain transition-transform duration-300 group-hover:scale-105',
              !variant.inStock && 'opacity-60 grayscale',
            )}
          />
        )}
      </Link>

      <h3 className={cn('mt-3 text-sm leading-snug font-semibold @2xs:text-base', muted)}>
        <Link href={link} className="hover:underline">
          {product.title}
          {/* In the link, so each colour card's link names its colour (or size). */}
          {single && product.variants.length > 1 && (
            <span className="block font-normal text-muted-foreground">{variant.name}</span>
          )}
        </Link>
      </h3>

      {product.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {product.tags.map((tag, i) => (
            <li
              key={`${i}-${tag}`}
              className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {!single && hasPalette(product.variants) && (
        <>
          <ColorSwatches
            variants={product.variants}
            selected={selected}
            onSelect={setPicked}
            className="mt-3"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {t('colour')}: <span className="font-semibold text-foreground">{variant.name}</span>
          </p>
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <ProductPrice
          price={variant.price}
          fullPrice={variant.fullPrice}
          className={muted || undefined}
        />
        {variant.inStock ? (
          <SelectedVariantContext.Provider value={{ product, variant }}>
            {buy}
          </SelectedVariantContext.Provider>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">{t('outOfStock')}</p>
        )}
      </div>
    </article>
  )
}
