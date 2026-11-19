import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '../lib/slugify'

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
