'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import { hasPalette } from '../model/defaultVariant'
import { SelectedVariantContext } from '../model/selectedVariant'
import type { ProductCardData } from '../model/types'
import { ColorSwatchLinks } from './ColorSwatches'
import { ProductGallery } from './ProductGallery'
import { ProductPrice } from './ProductPrice'

type Props = {
  // The series of the product, with every colour for the palette.
  product: ProductCardData
  // Index of this product's colour in the series.
  selected: number
  // The page heading: the name with the colour.
  name: string
  // The buy button, shown for a colour in stock; it reads the picked colour from SelectedVariantContext.
  buy?: ReactNode
  // Shown under the buy button (delivery terms).
  children?: ReactNode
}

// Top of the product page: photos of the colour on the left (the large photo opens the full-screen
// gallery), title, palette, price and buy button on the right. Each colour of the palette is a link to its
// own page.
export function ProductView({ product, selected, name, buy, children }: Props) {
  const t = useTranslations('ProductCard')
  const tPage = useTranslations('ProductPage')
  const [imageIndex, setImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const variant = product.variants[selected]
  if (!variant) return null
  const images = variant.images
  const image = images[imageIndex] ?? images[0]
  const step = (delta: number) =>
    setImageIndex((imageIndex + delta + images.length) % images.length)

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
          {image && (
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              aria-label={t('openGallery', { name })}
              className="absolute inset-0 cursor-zoom-in"
            >
              <Image
                key={image.url}
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-contain"
              />
            </button>
          )}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full shadow"
                onClick={() => step(-1)}
                aria-label={t('previous')}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full shadow"
                onClick={() => step(1)}
                aria-label={t('next')}
              >
                <ChevronRightIcon />
              </Button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((thumb, i) => (
              <li key={`${i}-${thumb.url}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={t('photo', { index: i + 1 })}
                  aria-current={i === imageIndex}
                  className={cn(
                    'relative block size-16 overflow-hidden rounded-md border-2 bg-white transition-colors md:size-20',
                    i === imageIndex
                      ? 'border-foreground'
                      : 'border-transparent hover:border-border',
                  )}
                >
                  <Image src={thumb.url} alt="" fill sizes="80px" className="object-contain" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="md:pt-2">
        {product.series && (
          <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            {product.series}
          </p>
        )}
        <h1 className="mt-2 text-[1.75rem] leading-tight md:text-3xl">{name}</h1>

        {product.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {product.tags.map((tag, i) => (
              <li
                key={`${i}-${tag}`}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <ProductPrice
          price={variant.price}
          fullPrice={variant.fullPrice}
          size="lg"
          className="mt-6"
        />
        {variant.inStock && (
          <p className="mt-1 flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-emerald-600" aria-hidden="true" />
            {tPage('inStock')}
          </p>
        )}

        {hasPalette(product.variants) && (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              {t('colour')}: <span className="font-semibold text-foreground">{variant.name}</span>
            </p>
            <ColorSwatchLinks variants={product.variants} selected={selected} className="mt-3" />
          </>
        )}

        {variant.inStock ? (
          <div className="mt-8">
            <SelectedVariantContext.Provider value={{ product, variant }}>
              {buy}
            </SelectedVariantContext.Provider>
          </div>
        ) : (
          <p className="mt-8 text-base font-semibold text-muted-foreground">{t('outOfStock')}</p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>

      <ProductGallery
        title={name}
        images={images}
        index={imageIndex}
        onIndexChange={setImageIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </div>
  )
}
