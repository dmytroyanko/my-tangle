import { getTranslations } from 'next-intl/server'

import { brands, type BrandKey } from '@/shared/config'

import type { ProductSpec } from '../model/specKeys'

// Characteristics of a product as a two-column list, always open: short facts read at a glance. Brand and
// brand country come from the category's brand instead of each product.
export async function ProductSpecs({
  specs,
  brand,
  className,
}: {
  specs: ProductSpec[]
  brand: BrandKey
  className?: string
}) {
  const t = await getTranslations('ProductSpecs')
  const rows = [
    ...specs.map((spec) => ({ name: t(`keys.${spec.key}`), value: spec.value })),
    { name: t('keys.brand'), value: brands[brand] },
    { name: t('keys.brandCountry'), value: t(`countries.${brand}`) },
  ]

  return (
    <section aria-labelledby="specs-title" className={className}>
      <h2 id="specs-title" className="text-xl md:text-2xl">
        {t('title')}
      </h2>
      <dl className="mt-4 divide-y divide-border border-y border-border text-base">
        {rows.map((row, index) => (
          <div
            // A key can be added twice in the admin, so the position keeps rows apart.
            key={index}
            className="grid gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6"
          >
            <dt className="text-muted-foreground">{row.name}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
