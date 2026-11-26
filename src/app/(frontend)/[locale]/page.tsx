import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { siteUrl } from '@/shared/config'
import { alternates, getPathname } from '@/shared/i18n'
import { storeJsonLd } from '@/shared/lib/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { CategoryShowcases } from '@/widgets/category-showcase'
import { HomeFaq } from '@/widgets/home-faq'
import { HomeHero } from '@/widgets/home-hero'

// Products come from Payload, so the page renders per request: the build has no database, and admin edits
// show up at once. Caching with on-demand revalidation comes later.
export const dynamic = 'force-dynamic'

// Canonical and hreflang are set per page, so pages without them (e.g. 404) do not point at the home page.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { alternates: alternates(locale, '/') }
}

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
      <BundleDiscount className="pt-4 lg:pt-6" />
      {/* Categories marked for the home page in the admin. The banner button scrolls here. */}
      <CategoryShowcases id="catalog" />
      <HomeFaq className="pt-4 pb-16 md:pb-20" />
    </>
  )
}
