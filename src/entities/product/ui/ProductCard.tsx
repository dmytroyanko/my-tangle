'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

import { colorKey } from '../model/colorKey'
import { defaultVariantIndex, hasPalette } from '../model/defaultVariant'
import type { ProductCardData } from '../model/types'
import { ColorSwatches } from './ColorSwatches'

type Props = {
  product: ProductCardData
  // Product page path without the locale, e.g. /the-ultimate-detangler/matte.
  href: string
  priority?: boolean
}

// One series with its colours: picking a swatch switches the photo, price and availability; the photo and
// title open the product page with that colour. Sizes follow the card's container (@container on the parent).
export function ProductCard({ product, href, priority = false }: Props) {
  const t = useTranslations('ProductCard')
  const defaultIndex = defaultVariantIndex(product.variants)
  const [selected, setSelected] = useState(defaultIndex)

  const variant = product.variants[selected]
  if (!variant) return null
  const image = variant.images[0]
  // The default colour needs no parameter, so the plain product URL is what gets linked and crawled.
  const link = selected === defaultIndex ? href : `${href}?color=${colorKey(variant.name)}`

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
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </Link>

      <h3 className="mt-3 text-sm leading-snug font-semibold @2xs:text-base">
        <Link href={link} className="hover:underline">
          {product.title}
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

      {hasPalette(product.variants) && (
        <>
          <ColorSwatches
            variants={product.variants}
            selected={selected}
            onSelect={setSelected}
            className="mt-3"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {t('colour')}: <span className="font-semibold text-foreground">{variant.name}</span>
            {!variant.inStock && <span> · {t('outOfStock')}</span>}
          </p>
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <p className="text-lg font-bold">{t('price', { price: variant.price })}</p>
        {/* Buying is not wired yet: the button is a placeholder until the cart exists. */}
        <Button
          type="button"
          disabled={!variant.inStock}
          className="w-full rounded-full px-6 @2xs:w-auto"
        >
          {variant.inStock ? t('buy') : t('outOfStock')}
        </Button>
      </div>
    </article>
  )
}
