import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import type { PageData } from '@/entities/page'
import { siteUrl } from '@/shared/config'
import { getPathname, type Locale } from '@/shared/i18n'
import { articleJsonLd, breadcrumbJsonLd } from '@/shared/lib/structured-data'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { articleClassName, RichText } from '@/shared/ui/rich-text'

type Props = {
  page: PageData
  // This page's path in the current locale, e.g. /kak-myt-tangle-teezer.
  path: string
  locale: Locale
  // Shown under the text, e.g. a way back to the catalog.
  children?: ReactNode
}

// An information page from Payload (an article such as "How to clean a Tangle Teezer"): title, text with
// photos, and what the route adds under it.
export async function InfoPage({ page, path, locale, children }: Props) {
  const tCrumbs = await getTranslations('Breadcrumbs')
  const absolute = (href: string) => new URL(getPathname({ locale, href }), siteUrl).href

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          url: absolute(path),
          headline: page.title,
          description: page.meta.description ?? undefined,
          image: page.meta.image ? new URL(page.meta.image.url, siteUrl).href : undefined,
          dateModified: page.updatedAt,
          locale,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tCrumbs('home'), url: absolute('/') },
          { name: page.title, url: absolute(path) },
        ])}
      />

      <div className="container pt-5 pb-12 md:pb-16">
        <Breadcrumbs
          label={tCrumbs('label')}
          items={[{ name: tCrumbs('home'), href: '/' }, { name: page.title }]}
        />

        <article className="mt-6 max-w-3xl md:mt-8">
          <h1 className="text-[1.75rem] leading-tight md:text-4xl">{page.title}</h1>
          {page.content && (
            <RichText
              data={page.content}
              headingTag="as-saved"
              className={`mt-6 ${articleClassName}`}
            />
          )}
        </article>

        {children}
      </div>
    </>
  )
}
