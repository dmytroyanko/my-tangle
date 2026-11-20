'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { KeyboardEvent } from 'react'

import { cn } from '@/shared/lib/utils'
import type { ImageData } from '@/shared/lib/media'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'

type Props = {
  title: string
  images: ImageData[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Full-size photos of one colour with arrows, thumbnails and keyboard navigation (← →).
export function ProductGallery({ title, images, index, onIndexChange, open, onOpenChange }: Props) {
  const t = useTranslations('ProductCard')
  const image = images[index]
  const step = (delta: number) => onIndexChange((index + delta + images.length) % images.length)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') step(-1)
    if (event.key === 'ArrowRight') step(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t('close')}
        onKeyDown={onKeyDown}
        // The title names the photo set; there is no separate description.
        aria-describedby={undefined}
        className="gap-3 p-4 sm:max-w-2xl md:p-6">
        <DialogTitle className="pr-8 text-base">{title}</DialogTitle>
        {image && (
          <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
            <Image
              key={image.url}
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 640px, 100vw"
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full shadow"
                  onClick={() => step(-1)}
                  aria-label={t('previous')}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full shadow"
                  onClick={() => step(1)}
                  aria-label={t('next')}
                >
                  <ChevronRightIcon />
                </Button>
              </>
            )}
          </div>
        )}
        {images.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {images.map((thumb, i) => (
              <li key={`${i}-${thumb.url}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={t('photo', { index: i + 1 })}
                  aria-current={i === index}
                  className={cn(
                    'relative block size-16 overflow-hidden rounded-md border-2 bg-white transition-colors',
                    i === index ? 'border-foreground' : 'border-transparent hover:border-border',
                  )}
                >
                  <Image src={thumb.url} alt="" fill sizes="64px" className="object-contain" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
