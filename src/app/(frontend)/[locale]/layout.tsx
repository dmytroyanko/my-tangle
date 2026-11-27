import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { Open_Sans } from 'next/font/google'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { getBundleDiscount } from '@/entities/cart'
import { getTrackingTags, TrackingNoscript, TrackingTags } from '@/entities/tracking-tag'
import { siteUrl } from '@/shared/config'
import { routing } from '@/shared/i18n'
import { ScrollToTop } from '@/shared/ui/scroll-to-top'
import { CartSheet } from '@/widgets/cart-sheet'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'
import '../globals.css'

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-open-sans',
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// The layout reads Payload (catalog menu, analytics tags, bundle discount), so every page renders per
// request, also the ones without data of their own (contacts, checkout, 404): the build has no database,
// and a page built without it would keep an empty menu and no tags.
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    // Absolute base for canonical and hreflang URLs.
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    // Tangle Teezer favicon (files in public/, shared with the admin).
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { url: '/icon.png', type: 'image/png', sizes: '134x134' },
      ],
      apple: '/icon.png',
    },
  }
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  // The bundle discount for the cart panel; the site still renders if the database is unavailable.
  const bundlePercent = await getBundleDiscount().catch(() => null)
  const tFooter = await getTranslations('Footer')
  // Analytics only on the production build, so development visits stay out of the statistics.
  const trackingTags =
    process.env.NODE_ENV === 'production' ? await getTrackingTags().catch(() => []) : []

  return (
    <html lang={locale} className={openSans.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-svh flex-col">
        <TrackingNoscript tags={trackingTags} />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSheet bundlePercent={bundlePercent} />
          <ScrollToTop label={tFooter('toTop')} />
        </NextIntlClientProvider>
        <TrackingTags tags={trackingTags} />
      </body>
    </html>
  )
}
