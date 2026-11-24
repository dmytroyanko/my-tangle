import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { Open_Sans } from 'next/font/google'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { getBundleDiscount } from '@/entities/cart'
import { siteUrl } from '@/shared/config'
import { routing } from '@/shared/i18n'
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

  return (
    <html lang={locale} className={openSans.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSheet bundlePercent={bundlePercent} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
