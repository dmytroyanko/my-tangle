import { ChevronRightIcon } from 'lucide-react'

import { Link } from '@/shared/i18n'

export type Crumb = { name: string; href?: string }

// Path to the current page. The last item is the page itself (no link, aria-current).
export function Breadcrumbs({ items, label, className }: { items: Crumb[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <li key={`${i}-${item.name}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRightIcon className="size-3" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
