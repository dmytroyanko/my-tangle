import { getTranslations, setRequestLocale } from 'next-intl/server'

import { siteUrl } from '@/shared/config'
import { getPathname } from '@/shared/i18n'
import { storeJsonLd } from '@/shared/lib/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'
import { BundleDiscount } from '@/widgets/bundle-discount'
import { CategoryShowcase } from '@/widgets/category-showcase'
import { HomeHero } from '@/widgets/home-hero'

// Products come from Payload, so the page renders per request: the build has no database, and admin edits
// show up at once. Caching with on-demand revalidation comes later.
export const dynamic = 'force-dynamic'

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
      {/* The banner button scrolls here; the anchor stays even if the category is missing. */}
      <div id="catalog">
        <CategoryShowcase slug="the-ultimate-detangler" className="py-12 md:py-16" />
      </div>
    </>
  )
}
