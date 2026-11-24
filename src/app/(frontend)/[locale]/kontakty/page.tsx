import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { siteName, siteUrl } from '@/shared/config'
import { alternates, getPathname } from '@/shared/i18n'
import { breadcrumbJsonLd, contactPageJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { CatalogCta } from '@/widgets/catalog-cta'
import { DeliveryInfo } from '@/widgets/delivery-info'
import { StoreContacts } from '@/widgets/store-contacts'

type Props = { params: Promise<{ locale: string }> }

// The current site's URL (/kontakty.html redirects here at cutover). A static route, so it wins over
// the category route /[slug].
const path = '/kontakty'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ContactsPage' })
  const title = t('metaTitle')
  const description = t('metaDescription')

  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: { title, description, siteName },
  }
}

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tCrumbs, tMeta, tOrg] = await Promise.all([
    getTranslations('ContactsPage'),
    getTranslations('Breadcrumbs'),
    getTranslations('Metadata'),
    getTranslations('Organization'),
  ])
  const absolute = (href: string) => new URL(getPathname({ locale, href }), siteUrl).href

  return (
    <>
      <JsonLd
        data={contactPageJsonLd({
          url: absolute(path),
          name: t('title'),
          locale,
          homeUrl: absolute('/'),
          description: tMeta('description'),
          streetAddress: tOrg('streetAddress'),
          locality: tOrg('locality'),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCrumbs('home'), url: absolute('/') },
          { name: t('title'), url: absolute(path) },
        ])}
      />

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          label={tCrumbs('label')}
          items={[{ name: tCrumbs('home'), href: '/' }, { name: t('title') }]}
        />

        <header className="mt-6 md:mt-8">
          <h1 className="text-[1.75rem] leading-tight md:text-4xl">{t('title')}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t('lead')}</p>
        </header>

        <StoreContacts className="mt-8 md:mt-10" />
        <DeliveryInfo className="mt-6" />

        <CatalogCta className="mt-10" />
      </div>
    </>
  )
}
