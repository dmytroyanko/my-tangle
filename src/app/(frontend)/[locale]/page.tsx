import { getTranslations, setRequestLocale } from 'next-intl/server'

import { siteUrl } from '@/shared/config'
import { getPathname } from '@/shared/i18n'
import { storeJsonLd } from '@/shared/lib/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { HomeHero } from '@/widgets/home-hero'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tMeta = await getTranslations('Metadata')
  const tOrg = await getTranslations('Organization')

  return (
    <>
      <JsonLd
        data={storeJsonLd({
          homeUrl: new URL(getPathname({ locale, href: '/' }), siteUrl).href,
          locale,
          description: tMeta('description'),
          streetAddress: tOrg('streetAddress'),
          locality: tOrg('locality'),
        })}
      />
      <HomeHero />
      <BundleDiscount className="pb-12 lg:pt-6" />
    </>
  )
}
