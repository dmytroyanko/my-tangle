import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { catalog } from '@/shared/config'
import { Link } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { pageTitleClassName } from '@/shared/ui/page-header'

// 404 inside the site layout (header and footer): a short explanation, the catalog and the home page.
// Next.js sends the 404 status and adds noindex.

// The 404 title; the layout's would describe the whole shop.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: await getLocale(), namespace: 'NotFound' })
  return { title: t('metaTitle') }
}

export default async function NotFound() {
  const t = await getTranslations('NotFound')
  const tCatalog = await getTranslations('Catalog')

  return (
    <div className="container py-12 md:py-20">
      <p className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">404</p>
      <h1 className={`mt-2 ${pageTitleClassName}`}>{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t('text')}</p>
      <Button asChild className="mt-6 rounded-full px-6">
        <Link href="/">{t('home')}</Link>
      </Button>

      <nav aria-labelledby="not-found-catalog" className="mt-12">
        <h2 id="not-found-catalog" className="text-xl md:text-2xl">
          {t('catalog')}
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {catalog.map(({ key, href }) => (
            <li key={key}>
              <Link
                href={href}
                className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {tCatalog(key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
