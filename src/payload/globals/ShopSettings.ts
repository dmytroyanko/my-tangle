import type { GlobalConfig } from 'payload'

import { repriceProducts } from '../hooks/salePrices'

// Shop-wide settings edited in the admin.
export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Налаштування магазину',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'discountPercent',
      label: 'Знижка на сайті, %',
      type: 'number',
      required: true,
      defaultValue: 20,
      min: 0,
      max: 90,
      admin: {
        description:
          'Ціна на сайті = повна ціна мінус знижка, округлено до гривні. Після збереження ціни всіх товарів перераховуються (крім товарів з власною знижкою).',
      },
    },
  ],
  hooks: { afterChange: [repriceProducts] },
}
