import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Button } from '@/shared/ui/button'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('HomePage')

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">My-Tangle</h1>
      <p className="text-muted-foreground">{t('lead')}</p>
      <Button asChild>
        {/* The admin is outside the localized routes, so a plain Next link. */}
        <Link href="/admin">{t('admin')}</Link>
      </Button>
    </div>
  )
}
