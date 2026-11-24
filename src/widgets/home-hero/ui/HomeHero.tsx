import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/shared/ui/button'

import desktopImage from './images/hero-desktop.jpg'

// Home page banner, as wide as the page container. Phones show the products cropped from the wide photo
// to 4:3, with the text below; tablets the whole photo with the text below; from lg the text sits on the
// empty wall in the right part of the photo.
export async function HomeHero() {
  const t = await getTranslations('HomeHero')

  return (
    <section aria-labelledby="home-hero-title" className="container pt-4 md:pt-6">
      <div className="relative">
        <Image
          src={desktopImage}
          alt={t('imageAlt')}
          sizes="(min-width: 80rem) 76rem, 100vw"
          loading="eager"
          fetchPriority="high"
          className="block aspect-[4/3] h-auto w-full rounded-xl object-cover object-[37%_50%] sm:aspect-[16/9] md:aspect-auto"
        />

        <div className="@container flex flex-col items-center py-8 text-center md:py-10 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[38%] lg:justify-center lg:px-4 lg:py-0">
          {/* Two lines on every screen: each line is a non-wrapping block, and the size follows the text
              block's width (cqi) so the longer Russian first line still fits. */}
          <h1 id="home-hero-title" className="text-[min(7.1cqi,2.5rem)] leading-tight">
            {t.rich('title', { line: (chunks) => <span className="block whitespace-nowrap">{chunks}</span> })}
          </h1>
          <p className="mt-4 max-w-lg text-base text-pretty text-foreground/80 xl:text-lg">{t('lead')}</p>
          <Button
            asChild
            size="lg"
            className="mt-6 h-12 rounded-full px-10 text-xs font-semibold tracking-[0.15em] uppercase xl:mt-8"
          >
            <a href="#catalog">{t('cta')}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
