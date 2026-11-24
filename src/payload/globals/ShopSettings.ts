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
    {
      type: 'row',
      fields: [
        {
          name: 'bundleDiscountEnabled',
          label: 'Знижка за комплект увімкнена',
          type: 'checkbox',
          defaultValue: false,
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
