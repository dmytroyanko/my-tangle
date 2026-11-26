'use client'

import { GripIcon, LayoutGridIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type ComponentProps } from 'react'

import { ProductGrid, type ProductListView } from '@/entities/product/index.client'
import { cn } from '@/shared/lib/utils'

type Props = Omit<ComponentProps<typeof ProductGrid>, 'view'> & {
  // The category's view from the admin: the server renders it, and a visitor sees it until they switch.
  // The switch is not remembered, so every category opens in the view the admin chose for it.
  defaultView: ProductListView
}

// The category's product list with a switch between series cards (with the palette) and a card per colour.
// Icon buttons (named for screen readers and on hover). The switch shows only when some series has more
// than one colour (or size); otherwise both views are the same.
export function ProductViewSwitch({ defaultView, products, ...grid }: Props) {
  const t = useTranslations('ProductViewSwitch')
  const [view, setView] = useState(defaultView)
  const switchable = products.some((product) => product.variants.length > 1)

  const options = [
    { value: 'groups', label: t('groups'), icon: LayoutGridIcon },
    { value: 'grid', label: t('grid'), icon: GripIcon },
  ] as const

  return (
    <>
      {switchable && (
        <div role="group" aria-label={t('label')} className="mt-6 flex justify-end gap-1">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              aria-label={label}
              title={label}
              onClick={() => setView(value)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-full border transition-colors',
                view === value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <ProductGrid {...grid} products={products} view={view} />
    </>
  )
}
