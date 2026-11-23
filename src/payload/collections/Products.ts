import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', '_status'],
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'title', localized: true, slugify }),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'series',
      type: 'text',
      admin: { description: 'Серія для бейджа на картці, наприклад «Fine & Fragile»' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Порядок у категорії, менше — вище' },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      localized: true,
      admin: { description: 'Короткі ярлики на картці, наприклад «Вологе й сухе волосся»' },
    },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'грн' } },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          admin: { description: 'Стара ціна, грн (якщо є знижка)' },
        },
      ],
    },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'specs',
      label: 'Характеристики',
      type: 'array',
      // Rows are shared by both languages, only the value is translated, so the list keeps the same order.
      labels: { singular: 'Характеристика', plural: 'Характеристики' },
      admin: {
        initCollapsed: true,
        description:
          'Таблиця під описом на сторінці товару. Бренд і країна бренду додаються автоматично.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'key',
              label: 'Характеристика',
              type: 'select',
              required: true,
              // Keys match src/entities/product/model/specKeys.ts; site labels are in messages (ProductSpecs).
              options: [
                { label: 'Тип волосся', value: 'hairType' },
                { label: 'Використання', value: 'use' },
                { label: 'Зубчики', value: 'teeth' },
                { label: 'Розмір', value: 'size' },
                { label: 'Покриття', value: 'finish' },
                { label: 'Особливості', value: 'features' },
                { label: 'Довжина', value: 'length' },
                { label: 'Вага', value: 'weight' },
              ],
            },
            { name: 'value', label: 'Значення', type: 'text', required: true, localized: true },
          ],
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      labels: { singular: 'Варіант', plural: 'Варіанти' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { description: 'Колір, наприклад «Radiant Teal»' } },
            { name: 'sku', type: 'text' },
          ],
        },
        {
          name: 'color',
          type: 'text',
          admin: { description: 'Колір кружечка в палітрі, HEX, наприклад #e3b8c0' },
          validate: (value: string | null | undefined) =>
            !value || /^#[0-9a-f]{6}$/i.test(value) || 'Формат #rrggbb',
        },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'number', min: 0, admin: { description: 'Якщо відрізняється від ціни товару' } },
            { name: 'inStock', type: 'checkbox', defaultValue: true },
          ],
        },
        { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
