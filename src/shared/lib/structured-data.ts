import { foundedYear, openingHours, phones, siteName, siteUrl } from '@/shared/config'

type StoreJsonLdInput = {
  // Absolute URL of the home page in the current locale.
  homeUrl: string
  locale: string
  description: string
  streetAddress: string
  locality: string
}

const organizationId = `${siteUrl}/#organization`

// The store itself. Its @id is the same in every locale and on every page, so search engines treat both
// language versions and all pages that describe it as one organization.
function storeNode({ homeUrl, description, streetAddress, locality }: Omit<StoreJsonLdInput, 'locale'>) {
  return {
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
    openingHoursSpecification: openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    contactPoint: phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone.href.replace('tel:', ''),
      contactType: 'customer service',
      areaServed: 'UA',
      availableLanguage: ['uk', 'ru'],
    })),
  }
}

// The store and the website, for the home page.
export function storeJsonLd({ locale, ...store }: StoreJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      storeNode(store),
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        url: store.homeUrl,
        inLanguage: locale,
        publisher: { '@id': organizationId },
      },
    ],
  }
}

// The contacts page: describes the store (same @id as on the home page). `url` is absolute.
export function contactPageJsonLd({
  url,
  name,
  locale,
  ...store
}: StoreJsonLdInput & { url: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        url,
        name,
        inLanguage: locale,
        mainEntity: { '@id': organizationId },
      },
      storeNode(store),
    ],
  }
}

// An article (an information page). The shop is its author and publisher, with the same @id as on the home
// page. Only the last change date is given: the pages were moved from the old site, so their creation date
// here is not when they were written. `url` and `image` are absolute.
export function articleJsonLd({
  url,
  headline,
  description,
  image,
  dateModified,
  locale,
}: {
  url: string
  headline: string
  description?: string
  image?: string
  dateModified: string
  locale: string
}) {
  const shop = { '@type': 'Organization', '@id': organizationId, name: siteName, url: siteUrl }
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image ? [image] : undefined,
    dateModified,
    inLanguage: locale,
    mainEntityOfPage: url,
    author: shop,
    publisher: shop,
  }
}

// Questions and answers shown on a page (answers as plain text).
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
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

type ProductJsonLdInput = {
  name: string
  brand: string
  description?: string
  url: string
  images: string[]
  prices: number[]
  inStock: boolean
  // Characteristics as label and value, e.g. «Зубчики: дворівневі».
  properties?: { name: string; value: string }[]
}

// A product with its price (a range when colours cost differently) and availability, for rich results.
export function productJsonLd({
  name,
  brand,
  description,
  url,
  images,
  prices,
  inStock,
  properties = [],
}: ProductJsonLdInput) {
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const availability = `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    image: images,
    brand: { '@type': 'Brand', name: brand },
    additionalProperty: properties.length
      ? properties.map(({ name, value }) => ({ '@type': 'PropertyValue', name, value }))
      : undefined,
    offers:
      low === high
        ? { '@type': 'Offer', price: low, priceCurrency: 'UAH', availability, url }
        : {
            '@type': 'AggregateOffer',
            lowPrice: low,
            highPrice: high,
            offerCount: prices.length,
            priceCurrency: 'UAH',
            availability,
            url,
          },
  }
}

type ProductGroupJsonLdInput = {
  name: string
  brand: string
  description?: string
  url: string
  // A stable id of the series, e.g. its slug.
  groupId: string
  // The colours, each a product page of its own.
  variants: { name: string; url: string; image?: string; price: number; inStock: boolean }[]
}

// A series page: the series as a ProductGroup varying by colour, each colour with its own page and offer.
export function productGroupJsonLd({
  name,
  brand,
  description,
  url,
  groupId,
  variants,
}: ProductGroupJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name,
    description,
    url,
    productGroupID: groupId,
    brand: { '@type': 'Brand', name: brand },
    variesBy: 'https://schema.org/color',
    hasVariant: variants.map((variant) => ({
      '@type': 'Product',
      name: variant.name,
      url: variant.url,
      image: variant.image,
      offers: {
        '@type': 'Offer',
        price: variant.price,
        priceCurrency: 'UAH',
        availability: `https://schema.org/${variant.inStock ? 'InStock' : 'OutOfStock'}`,
        url: variant.url,
      },
    })),
  }
}
