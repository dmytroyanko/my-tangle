import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { contentEditors, publishedOrEditors } from '../access'
import { computeSalePrices } from '../hooks/salePrices'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', '_status'],
  },
  access: {
    read: publishedOrEditors,
    readVersions: contentEditors,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [computeSalePrices],
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
        {
          name: 'fullPrice',
          label: 'Повна ціна, грн',
          type: 'number',
          // Checked here instead of `required`, which would make the column NOT NULL and stop the schema
          // update on products that already exist.
          validate: (value: number | null | undefined) =>
            typeof value === 'number' || 'Вкажіть повну ціну',
          min: 0,
          admin: { description: 'РРЦ: щітки — ціна постачальника мінус 1 грн, Invisibobble — як у постачальника' },
        },
        {
          name: 'discountPercent',
          label: 'Знижка, %',
          type: 'number',
          min: 0,
          max: 90,
          admin: { description: 'Порожньо — знижка з «Налаштувань магазину», 0 — без знижки' },
        },
        {
          name: 'price',
          label: 'Ціна на сайті, грн',
          type: 'number',
          min: 0,
          admin: { readOnly: true, description: 'Рахується автоматично при збереженні' },
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
                { label: 'Для кого (тварини)', value: 'animal' },
                { label: 'Тип волосся', value: 'hairType' },
                { label: 'Шерсть (тварини)', value: 'coat' },
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
            {
              name: 'fullPrice',
              label: 'Повна ціна, грн',
              type: 'number',
              min: 0,
              admin: { description: 'Якщо відрізняється від повної ціни товару' },
            },
            {
              name: 'discountPercent',
              label: 'Знижка, %',
              type: 'number',
              min: 0,
              max: 90,
              admin: { description: 'Якщо відрізняється від знижки товару' },
            },
            {
              name: 'price',
              label: 'Ціна на сайті, грн',
              type: 'number',
              min: 0,
              admin: { readOnly: true },
            },
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
