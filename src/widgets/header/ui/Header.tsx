import { PhoneIcon, ShoppingBagIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { LocaleSwitcher } from '@/features/locale-switcher'
import { phones } from '@/shared/config'
import { Link } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

import { navigation } from '../config/navigation'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './NavLink'

export async function Header() {
  const t = await getTranslations('Header')
  const tNav = await getTranslations('Navigation')

  return (
    <header>
      {/* Top bar: tagline, phones, language */}
      <div className="bg-muted text-xs text-foreground">
        <div className="container flex h-8 items-center gap-4">
          <p className="mr-auto">
            <span className="font-semibold">My-Tangle</span>
            <span className="hidden sm:inline"> — {t('tagline')}</span>
          </p>
          <div className="hidden items-center gap-1.5 font-semibold md:flex">
            <PhoneIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {phones.map((phone, i) => (
              <span key={phone.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-muted-foreground" aria-hidden="true">
                    ·
                  </span>
                )}
                <a href={phone.href} className="hover:underline">
                  {phone.display}
                </a>
              </span>
            ))}
          </div>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Logo, catalog (from xl), account and cart */}
      <div className="border-b border-border">
        <div className="container flex h-16 items-center gap-1 lg:h-20 lg:gap-4 xl:h-auto">
          <MobileMenu title={t('menu')} openLabel={t('openMenu')} closeLabel={t('closeMenu')}>
            <nav aria-label={t('catalog')}>
              <ul className="grid grid-cols-2 gap-2">
                {navigation.map(({ key, href, icon }) => (
                  <li key={key}>
                    <NavLink
                      href={href}
                      className="flex h-full items-center gap-2 rounded-md border border-border p-2 text-xs leading-tight font-semibold transition-colors hover:bg-accent aria-[current=page]:border-foreground"
                    >
                      {/* Decorative: the label next to it names the item. */}
                      <Image src={icon} alt="" className="size-[35px] shrink-0" />
                      <span className="whitespace-pre-line">{tNav(key)}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground">{t('phones')}</p>
              {phones.map((phone) => (
                <a key={phone.href} href={phone.href} className="text-base font-semibold">
                  {phone.display}
                </a>
              ))}
            </div>
            <LocaleSwitcher className="text-base" />
          </MobileMenu>

          <Link
            href="/"
            aria-label={t('home')}
            className="mr-auto shrink-0 text-foreground xl:mr-4"
          >
            <Logo className="h-8 w-auto lg:h-10" />
          </Link>

          {/* Catalog: one row with equal-width items from xl; below xl it is in the burger menu */}
          <nav aria-label={t('catalog')} className="hidden flex-1 self-stretch xl:block">
            <ul
              className="grid h-full"
              style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
            >
              {navigation.map(({ key, href, icon }) => (
                <li key={key}>
                  <NavLink
                    href={href}
                    className="group flex h-full flex-col items-center justify-center gap-1.5 border-b-2 border-transparent px-1 pt-3 pb-2.5 text-center transition-colors hover:border-border aria-[current=page]:border-foreground"
                  >
                    <Image
                      src={icon}
                      alt=""
                      className="size-[35px] opacity-80 transition-opacity group-hover:opacity-100"
                    />
                    <span className="text-xs leading-tight font-semibold whitespace-pre-line">
                      {tNav(key)}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <Button variant="ghost" size="icon-lg" className="md:hidden" asChild>
            <a href={phones[0].href} aria-label={t('call')}>
              <PhoneIcon className="size-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon-lg" asChild>
            <Link href="/account" aria-label={t('account')}>
              <UserIcon className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon-lg" className="-mr-2" asChild>
            <Link href="/cart" aria-label={t('cart')}>
              <ShoppingBagIcon className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
