import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

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
    { name: 'title', type: 'text', required: true },
    slugField({ useAsSlug: 'title' }),
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
      admin: { description: 'Серия для бейджа на карточке, например «Fine & Fragile»' },
    },
    {
      type: 'row',
      fields: [
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'грн' } },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          admin: { description: 'Старая цена, грн (если есть скидка)' },
        },
      ],
    },
    { name: 'description', type: 'richText' },
    {
      name: 'variants',
      type: 'array',
      labels: { singular: 'Вариант', plural: 'Варианты' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { description: 'Цвет, например «Radiant Teal»' } },
            { name: 'sku', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'number', min: 0, admin: { description: 'Если отличается от цены товара' } },
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
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
