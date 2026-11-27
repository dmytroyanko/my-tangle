'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { phones } from '@/shared/config'
import { Link } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { pageTitleClassName } from '@/shared/ui/page-header'

// A page that failed to render (the database is down, a bug), inside the site layout, so the header,
// the phones and the footer stay. Next.js answers with status 500, which search engines do not index.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container py-12 md:py-20">
      <p className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">500</p>
      <h1 className={`mt-2 ${pageTitleClassName}`}>{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">{t('text')}</p>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-base font-semibold">
        {phones.map((phone) => (
          <a key={phone.href} href={phone.href} className="hover:underline">
            {phone.display}
          </a>
        ))}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="rounded-full px-6" onClick={reset}>
          {t('retry')}
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  )
}
