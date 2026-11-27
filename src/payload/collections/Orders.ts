import type { CollectionConfig } from 'payload'

import { paymentMethods } from '@/shared/config'

import { adminOnly, orderHandlers, orderViewers } from '../access'
import { notifyNewOrder } from '../hooks/notifyNewOrder'
import { paymentLabels } from '../lib/paymentLabels'

// Orders from the checkout. They are created on the server (placeOrder), with prices taken from the
// products, never from the browser; public access stays closed. The order number is the document id.
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Замовлення', plural: 'Замовлення' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'lastName', 'phone', 'total', 'status', 'createdAt'],
  },
  access: {
    create: adminOnly,
    read: orderViewers,
    update: orderHandlers,
    delete: adminOnly,
  },
  hooks: { afterChange: [notifyNewOrder] },
  fields: [
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Нове', value: 'new' },
        { label: 'Підтверджене', value: 'confirmed' },
        { label: 'Відправлене', value: 'shipped' },
        { label: 'Виконане', value: 'completed' },
        { label: 'Скасоване', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'locale',
      label: 'Мова сайту',
      type: 'select',
      options: [
        { label: 'Українська', value: 'uk' },
        { label: 'Російська', value: 'ru' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'lastName', label: 'Прізвище', type: 'text' },
        { name: 'firstName', label: "Ім'я", type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Телефон', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      name: 'phoneNormalized',
      label: 'Телефон для пошуку',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: '+380XXXXXXXXX: за ним клієнт після реєстрації побачить свої замовлення',
      },
    },
    {
      name: 'items',
      label: 'Товари',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Товар', plural: 'Товари' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'product',
              label: 'Товар',
              type: 'relationship',
              relationTo: 'products',
              required: true,
            },
            { name: 'title', label: 'Назва', type: 'text' },
          ],
        },
        { name: 'variant', label: 'Колір', type: 'text' },
        {
          type: 'row',
          fields: [
            {
              name: 'quantity',
              label: 'Кількість',
              type: 'number',
              required: true,
              min: 1,
              defaultValue: 1,
            },
            { name: 'price', label: 'Ціна, грн', type: 'number', required: true, min: 0 },
            { name: 'fullPrice', label: 'Повна ціна, грн', type: 'number', min: 0 },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'fullTotal', label: 'Без знижки, грн', type: 'number', min: 0 },
        { name: 'discount', label: 'Знижка, грн', type: 'number', min: 0 },
        { name: 'total', label: 'Разом, грн', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'delivery',
      label: 'Доставка',
      type: 'group',
      fields: [
        {
          name: 'method',
          label: 'Спосіб',
          type: 'select',
          defaultValue: 'nova-poshta',
          options: [{ label: 'Нова Пошта', value: 'nova-poshta' }],
        },
        {
          type: 'row',
          fields: [
            { name: 'city', label: 'Місто', type: 'text' },
            { name: 'cityRef', label: 'Ref міста НП', type: 'text', admin: { readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'warehouse', label: 'Відділення або поштомат', type: 'text' },
            {
              name: 'warehouseRef',
              label: 'Ref відділення НП',
              type: 'text',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'payment',
      label: 'Оплата',
      type: 'select',
      defaultValue: 'cod',
      options: paymentMethods.map((value) => ({ label: paymentLabels[value], value })),
    },
    { name: 'comment', label: 'Коментар покупця', type: 'textarea' },
  ],
}
