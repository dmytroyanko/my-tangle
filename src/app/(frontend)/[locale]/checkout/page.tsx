import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getBundleDiscount } from '@/entities/cart'
import { CheckoutForm } from '@/features/checkout'
import { routes } from '@/shared/config'
import { alternates } from '@/shared/i18n'

type Props = { params: Promise<{ locale: string }> }

// Served at routes.checkout in each language (src/proxy.ts rewrites it to this folder). Not for search.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Checkout' })
  return {
    title: t('metaTitle'),
    alternates: alternates(locale, routes.checkout),
    robots: { index: false, follow: false },
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const bundlePercent = await getBundleDiscount().catch(() => null)

  return (
    <div className="container">
      <CheckoutForm bundlePercent={bundlePercent} />
    </div>
  )
}
