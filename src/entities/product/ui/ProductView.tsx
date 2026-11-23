'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

import { colorKey } from '../model/colorKey'
import { defaultVariantIndex } from '../model/defaultVariant'
import type { ProductCardData } from '../model/types'
import { ColorSwatches } from './ColorSwatches'
import { ProductGallery } from './ProductGallery'

type Props = {
  product: ProductCardData
  // Colour key from ?color=, read by the page on the server.
  initialColor?: string
  // Shown under the buy button (delivery terms).
  children?: ReactNode
}

// Top of the product page: photos of the selected colour on the left (the large photo opens the full-screen
// gallery), title, palette, price and buy button on the right. A picked colour is kept in ?color= without
// a navigation.
export function ProductView({ product, initialColor, children }: Props) {
  const t = useTranslations('ProductCard')
  const tPage = useTranslations('ProductPage')
  const fromUrl = product.variants.findIndex((variant) => colorKey(variant.name) === initialColor)
  const [selected, setSelected] = useState(fromUrl >= 0 ? fromUrl : defaultVariantIndex(product.variants))
  const [imageIndex, setImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const variant = product.variants[selected]
  if (!variant) return null
  const images = variant.images
  const image = images[imageIndex] ?? images[0]
  const fullName = `${product.title} ${variant.name}`

  const select = (index: number) => {
    setSelected(index)
    setImageIndex(0)
    // Every colour the visitor picks gets its own address to share, the default one too. The canonical
    // URL stays without the parameter.
    const chosen = product.variants[index]
    if (!chosen) return
    const url = new URL(window.location.href)
    url.searchParams.set('color', colorKey(chosen.name))
    window.history.replaceState(window.history.state, '', url)
  }
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
              aria-label={t('openGallery', { name: fullName })}
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
        <h1 className="mt-2 text-[1.75rem] leading-tight md:text-3xl">{product.title}</h1>

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

        <p className="mt-6 text-3xl font-bold">{t('price', { price: variant.price })}</p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <span
            className={cn(
              'size-2 rounded-full',
              variant.inStock ? 'bg-emerald-600' : 'bg-muted-foreground',
            )}
            aria-hidden="true"
          />
          {variant.inStock ? tPage('inStock') : t('outOfStock')}
        </p>

        <p className="mt-6 text-sm text-muted-foreground">
          {t('colour')}: <span className="font-semibold text-foreground">{variant.name}</span>
        </p>
        <ColorSwatches
          variants={product.variants}
          selected={selected}
          onSelect={select}
          size="lg"
          className="mt-3"
        />

        {/* Buying is not wired yet: the button is a placeholder until the cart exists. */}
        <Button
          type="button"
          size="lg"
          disabled={!variant.inStock}
          className="mt-8 h-12 w-full rounded-full px-10 text-sm font-semibold tracking-[0.1em] uppercase sm:w-auto"
        >
          {variant.inStock ? t('buy') : t('outOfStock')}
        </Button>

        {children && <div className="mt-8">{children}</div>}
      </div>

      <ProductGallery
        title={fullName}
        images={images}
        index={imageIndex}
        onIndexChange={setImageIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </div>
  )
}
