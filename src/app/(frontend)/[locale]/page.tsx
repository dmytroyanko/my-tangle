import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { siteUrl } from '@/shared/config'
import { getPathname } from '@/shared/i18n'
import { storeJsonLd } from '@/shared/lib/structured-data'
import { Button } from '@/shared/ui/button'
import { JsonLd } from '@/shared/ui/json-ld'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('HomePage')
  const tMeta = await getTranslations('Metadata')
  const tOrg = await getTranslations('Organization')

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <JsonLd
        data={storeJsonLd({
          homeUrl: new URL(getPathname({ locale, href: '/' }), siteUrl).href,
          locale,
          description: tMeta('description'),
          streetAddress: tOrg('streetAddress'),
          locality: tOrg('locality'),
        })}
      />
      <h1 className="text-4xl font-semibold tracking-tight">My-Tangle</h1>
      <p className="text-muted-foreground">{t('lead')}</p>
      <Button asChild>
        {/* The admin is outside the localized routes, so a plain Next link. */}
        <Link href="/admin">{t('admin')}</Link>
      </Button>
    </div>
  )
}
