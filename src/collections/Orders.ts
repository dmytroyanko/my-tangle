import type { CollectionConfig } from 'payload'

// Skeleton for the checkout stage: orders are created server-side, so public access stays closed.
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'customerName', 'phone', 'total', 'status', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Новый', value: 'new' },
        { label: 'Подтверждён', value: 'confirmed' },
        { label: 'Отправлен', value: 'shipped' },
        { label: 'Выполнен', value: 'completed' },
        { label: 'Отменён', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        {
          type: 'row',
          fields: [
            { name: 'variant', type: 'text' },
            { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1 },
            { name: 'price', type: 'number', required: true, min: 0 },
          ],
        },
      ],
    },
    { name: 'total', type: 'number', required: true, min: 0 },
    {
      name: 'delivery',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          defaultValue: 'nova-poshta',
          options: [
            { label: 'Нова пошта (отделение)', value: 'nova-poshta' },
            { label: 'Самовывоз', value: 'pickup' },
          ],
        },
        { name: 'city', type: 'text' },
        { name: 'warehouse', type: 'text' },
      ],
    },
    {
      name: 'payment',
      type: 'select',
      defaultValue: 'cod',
      options: [
        { label: 'Наложенный платёж', value: 'cod' },
        { label: 'Онлайн-оплата', value: 'online' },
      ],
    },
    { name: 'comment', type: 'textarea' },
  ],
}
