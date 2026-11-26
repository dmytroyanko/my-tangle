import { ChevronRightIcon } from 'lucide-react'

import { absoluteUrl, Link, type Locale } from '@/shared/i18n'
import { breadcrumbJsonLd } from '@/shared/lib/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'

// A step of the path: its name and its path without the locale.
export type Crumb = { name: string; href: string }

type Props = {
  // The path after the home page; the last item is the page itself (no link, aria-current).
  items: Crumb[]
  // Name of the home page, the first step.
  home: string
  // Name of the navigation for screen readers.
  label: string
  locale: Locale
  className?: string
}

// Path to the current page, with the same steps as BreadcrumbList structured data.
export function Breadcrumbs({ items, home, label, locale, className }: Props) {
  const crumbs = [{ name: home, href: '/' }, ...items]
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({ name: crumb.name, url: absoluteUrl(locale, crumb.href) })),
        )}
      />
      <nav aria-label={label} className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((crumb, i) => (
            <li key={`${i}-${crumb.name}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRightIcon className="size-3" aria-hidden="true" />}
              {i < crumbs.length - 1 ? (
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-foreground">
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
