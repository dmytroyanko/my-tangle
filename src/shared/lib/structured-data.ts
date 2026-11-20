import { foundedYear, phones, siteName, siteUrl } from '@/shared/config'

type StoreJsonLdInput = {
  // Absolute URL of the home page in the current locale.
  homeUrl: string
  locale: string
  description: string
  streetAddress: string
  locality: string
}

// The store and the website, for the home page. The store's @id is the same in every locale,
// so search engines treat both language versions as one organization.
export function storeJsonLd({ homeUrl, locale, description, streetAddress, locality }: StoreJsonLdInput) {
  const organizationId = `${siteUrl}/#organization`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': organizationId,
        name: siteName,
        url: homeUrl,
        description,
        foundingDate: String(foundedYear),
        telephone: phones[0].href.replace('tel:', ''),
        address: {
          '@type': 'PostalAddress',
          streetAddress,
          addressLocality: locality,
          addressCountry: 'UA',
        },
        contactPoint: phones.map((phone) => ({
          '@type': 'ContactPoint',
          telephone: phone.href.replace('tel:', ''),
          contactType: 'customer service',
          areaServed: 'UA',
          availableLanguage: ['uk', 'ru'],
        })),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        url: homeUrl,
        inLanguage: locale,
        publisher: { '@id': organizationId },
      },
    ],
  }
}

// Breadcrumb trail for search results. `url` is absolute.
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
