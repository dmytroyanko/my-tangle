import { cn } from '@/shared/lib/utils'

// Size of a page's h1 (the base h1 style is for headings inside content).
export const pageTitleClassName = 'text-[1.75rem] leading-tight md:text-4xl'

// The title of an inner page with an optional lead under it.
export function PageHeader({
  title,
  lead,
  className,
}: {
  title: string
  lead?: string | null
  className?: string
}) {
  return (
    <header className={cn('mt-6 md:mt-8', className)}>
      <h1 className={pageTitleClassName}>{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{lead}</p>}
    </header>
  )
}
