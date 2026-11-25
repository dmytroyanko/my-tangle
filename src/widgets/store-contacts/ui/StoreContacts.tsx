import {
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  type LucideIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { mapUrl, messengers, phones } from '@/shared/config'
import { externalLinkProps, isExternalUrl } from '@/shared/lib/links'
import { cn } from '@/shared/lib/utils'

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border p-5 md:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-4 text-base">{children}</div>
    </section>
  )
}

// Phones (with chats in messengers), address and working hours of the store as three cards. The phones and address are in <address>,
// the contact information of the page.
export async function StoreContacts({ className }: { className?: string }) {
  const t = await getTranslations('ContactsPage')

  return (
    <address className={cn('grid gap-4 not-italic md:grid-cols-3 md:gap-6', className)}>
      <Card icon={PhoneIcon} title={t('phonesTitle')}>
        <ul className="grid gap-2">
          {phones.map((phone) => (
            <li key={phone.href}>
              <a href={phone.href} className="text-lg font-semibold hover:underline">
                {phone.display}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">{t('phonesHint')}</p>
        <p className="mt-4 text-sm">{t('writeUs')}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {messengers.map((messenger) => (
            <li key={messenger.name}>
              <a
                href={messenger.href}
                {...(isExternalUrl(messenger.href) ? externalLinkProps : {})}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-foreground"
              >
                <MessageCircleIcon className="size-4" aria-hidden="true" />
                {messenger.name}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={MapPinIcon} title={t('addressTitle')}>
        <p>{t('address')}</p>
        <a
          href={mapUrl}
          {...externalLinkProps}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        >
          {t('openMap')}
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>
      </Card>

      <Card icon={ClockIcon} title={t('hoursTitle')}>
        <dl className="grid gap-2">
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-muted-foreground">{t('weekdays')}</dt>
            <dd className="font-semibold">{t('weekdaysHours')}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="text-muted-foreground">{t('weekend')}</dt>
            <dd className="font-semibold">{t('weekendHours')}</dd>
          </div>
        </dl>
      </Card>
    </address>
  )
}
