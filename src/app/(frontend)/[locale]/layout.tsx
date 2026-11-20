import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { Open_Sans } from 'next/font/google'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { siteUrl } from '@/shared/config'
import { alternates, routing } from '@/shared/i18n'
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
    alternates: alternates(locale, '/'),
  }
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale} className={openSans.variable}>
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
