import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access'
import { repriceProducts } from '../hooks/salePrices'

// Shop-wide settings edited in the admin.
export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: 'Налаштування магазину',
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'discountPercent',
      label: 'Знижка на сайті, %',
      type: 'number',
      required: true,
      // Brushes and sprays sell at the full price (supplier's price minus 1 UAH); a sale (Black Friday: 20%)
      // is set here for its duration.
      defaultValue: 0,
      min: 0,
      max: 90,
      admin: {
        description:
          'Ціна на сайті = повна ціна мінус знижка, округлено до гривні. Після збереження ціни всіх товарів перераховуються (крім товарів з власною знижкою).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bundleDiscountEnabled',
          label: 'Знижка за комплект увімкнена',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description:
              'Tangle Teezer разом з Invisibobble в одному замовленні: банер на сайті й знижка в кошику',
          },
        },
        {
          name: 'bundleDiscountPercent',
          label: 'Знижка за комплект, %',
          type: 'number',
          defaultValue: 7,
          min: 1,
          max: 50,
          required: true,
        },
      ],
    },
  ],
  hooks: { afterChange: [repriceProducts] },
}
