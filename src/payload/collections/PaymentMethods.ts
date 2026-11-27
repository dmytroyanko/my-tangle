import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access'

// Payment methods the checkout offers, in their order (the first one is picked by default), also listed in
// the delivery and payment block on product and category pages. A method switched off is hidden from the
// site; orders keep the name it had when they were placed.
export const PaymentMethods: CollectionConfig = {
  slug: 'payment-methods',
  labels: { singular: 'Спосіб оплати', plural: 'Способи оплати' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'enabled', 'order'],
    description:
      'Способи оплати на сторінці оформлення замовлення і в блоці «Доставка і оплата». Перший увімкнений обрано за замовчуванням.',
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      label: 'Назва',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Як бачить покупець: «Післяплата»' },
    },
    {
      name: 'note',
      label: 'Пояснення',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Під назвою: як і коли платити, комісія. Наприклад: «Оплата при отриманні. Комісія «Нової Пошти» – 2% від вартості замовлення + 20 грн.»',
      },
    },
    {
      name: 'enabled',
      label: 'Увімкнено',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Вимкнений спосіб не показується на сайті' },
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Менше – вище' },
    },
  ],
}
