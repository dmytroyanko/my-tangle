import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { routes } from '@/shared/config'
import { absoluteUrl, type Locale } from '@/shared/i18n'
import { pageMetadata } from '@/shared/lib/metadata'
import { contactPageJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { PageHeader } from '@/shared/ui/page-header'
import { CatalogCta } from '@/widgets/catalog-cta'
import { DeliveryInfo } from '@/widgets/delivery-info'
import { StoreContacts } from '@/widgets/store-contacts'

type Props = { params: Promise<{ locale: string }> }

// A static route (the folder name is the path in routes.contacts), so it wins over the category route
// /[slug]. The path is the same in both languages.
const path = routes.contacts.uk

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ContactsPage' })
  return pageMetadata({
    locale: locale as Locale,
    paths: path,
    title: t('metaTitle'),
    description: t('metaDescription'),
  })
}

export default async function ContactsPage({ params }: Props) {
  // The layout has checked the locale.
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, tCrumbs, tMeta, tOrg] = await Promise.all([
    getTranslations('ContactsPage'),
    getTranslations('Breadcrumbs'),
    getTranslations('Metadata'),
    getTranslations('Organization'),
  ])

  return (
    <>
      <JsonLd
        data={contactPageJsonLd({
          url: absoluteUrl(locale, path),
          name: t('title'),
          locale,
          homeUrl: absoluteUrl(locale, '/'),
          description: tMeta('description'),
          streetAddress: tOrg('streetAddress'),
          locality: tOrg('locality'),
        })}
      />

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          home={tCrumbs('home')}
          label={tCrumbs('label')}
          locale={locale}
          items={[{ name: t('title'), href: path }]}
        />

        <PageHeader title={t('title')} lead={t('lead')} />

        <StoreContacts className="mt-8 md:mt-10" />
        <DeliveryInfo className="mt-6" />

        <CatalogCta className="mt-10" />
      </div>
    </>
  )
}
