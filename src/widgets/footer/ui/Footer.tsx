import { MapPinIcon, PhoneIcon } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { catalog, foundedYear, phones } from '@/shared/config'
import { Link, type Locale } from '@/shared/i18n'
import { Logo } from '@/shared/ui/logo'

import { BritishFlag } from './BritishFlag'

// Information pages, by language: the articles have a Ukrainian slug and the current site's Russian one.
// Later these come from Payload pages.
const infoLinks = [
  {
    key: 'howToSpotOriginal',
    href: { uk: '/yak-vidriznyty-oryhinal', ru: '/kak-otlichit-original' },
  },
  { key: 'howToClean', href: { uk: '/yak-myty-tangle-teezer', ru: '/kak-myt-tangle-teezer' } },
  { key: 'faq', href: { uk: '/chasti-pytannia', ru: '/chastye-voprosy' } },
  { key: 'contacts', href: { uk: '/kontakty', ru: '/kontakty' } },
] as const

const headingClass = 'mb-4 text-xs font-semibold tracking-wider text-dark-foreground uppercase'
const linkClass = 'text-dark-foreground/70 transition-colors hover:text-dark-foreground'

export async function Footer() {
  const t = await getTranslations('Footer')
  const locale = (await getLocale()) as Locale
  const tCatalog = await getTranslations('Catalog')

  return (
    <footer className="bg-dark text-dark-foreground">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label={t('home')} className="inline-block">
            <Logo className="h-9 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-dark-foreground/70">{t('about')}</p>
        </div>

        <nav aria-labelledby="footer-catalog" className="sm:row-span-2 lg:row-span-1">
          <h2 id="footer-catalog" className={headingClass}>
            {t('catalog')}
          </h2>
          <ul className="grid gap-2.5">
            {catalog.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={linkClass}>
                  {tCatalog(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-info">
          <h2 id="footer-info" className={headingClass}>
            {t('info')}
          </h2>
          <ul className="grid gap-2.5">
            {infoLinks.map(({ key, href }) => (
              <li key={key}>
                <Link href={href[locale]} className={linkClass}>
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>{t('contacts')}</h2>
          <address className="grid gap-2.5 not-italic">
            {phones.map((phone) => (
              <a key={phone.href} href={phone.href} className="flex items-center gap-2 font-semibold hover:underline">
                <PhoneIcon className="size-4 text-dark-foreground/50" aria-hidden="true" />
                {phone.display}
              </a>
            ))}
            <p className="flex gap-2 text-dark-foreground/70">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-dark-foreground/50" aria-hidden="true" />
              {t('address')}
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-dark-foreground/15">
        <div className="container flex flex-col gap-3 py-5 text-xs text-dark-foreground/70 md:flex-row md:items-center md:justify-between">
          <p>
            © {foundedYear}–{new Date().getFullYear()} «My-Tangle». {t('rights')}
          </p>
          {/* The phrase is English in both locales, so screen readers switch pronunciation. */}
          <p lang="en" className="flex items-center gap-2">
            <BritishFlag className="h-3 w-6 shrink-0 rounded-[2px]" />
            {t('madeIn')}
          </p>
        </div>
      </div>
    </footer>
  )
}
