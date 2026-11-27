import type { CollectionConfig, FieldHook } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { contentEditors, publishedOrEditors } from '../access'
import { metaField, specsField, tagsField } from '../fields'
import { computeSalePrices } from '../hooks/salePrices'

// The admin list and the slug use the name with the colour; a field the update did not send keeps its saved
// value.
const composeFullTitle: FieldHook = ({ siblingData, originalDoc }) => {
  const title = siblingData.title ?? originalDoc?.title
  const colorName = siblingData.colorName ?? originalDoc?.colorName
  return [title, colorName].filter(Boolean).join(' ')
}

// One colour of a series is one product with its own page (/tangle-teezer-the-ultimate-detangler-large-
// black-gloss). The colours of a series are the products of one category: a subcategory, or a category
// without subcategories. Description, characteristics and tags shared by the series are set once in that
// category; a product fills them in only to differ.
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товари' },
  admin: {
    useAsTitle: 'fullTitle',
    defaultColumns: ['fullTitle', 'category', 'price', 'inStock', '_status'],
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
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          label: 'Назва',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Без кольору, як у серії: «The Ultimate Detangler Large»' },
        },
        {
          name: 'colorName',
          label: 'Колір',
          type: 'text',
          // Checked here instead of `required`, which would make the column NOT NULL.
          validate: (value: string | null | undefined) => Boolean(value?.trim()) || 'Вкажіть колір',
          admin: { description: 'Назва кольору або розміру: «Black Gloss», «150 мл»' },
        },
      ],
    },
    {
      name: 'fullTitle',
      label: 'Повна назва',
      type: 'text',
      localized: true,
      // Before the slug field, whose value is generated from this one.
      hooks: { beforeValidate: [composeFullTitle] },
      admin: { readOnly: true, description: 'Назва й колір, складається автоматично' },
    },
    slugField({ useAsSlug: 'fullTitle', localized: true, slugify }),
    {
      name: 'category',
      label: 'Категорія',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Підкатегорія серії, або категорія, якщо підкатегорій у ній немає',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Порядок у категорії, менше – вище' },
    },
    {
      name: 'inStock',
      label: 'Є в наявності',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'color',
          label: 'Колір у палітрі',
          type: 'text',
          admin: { description: 'HEX, наприклад #e3b8c0; порожньо – без палітри (спрей)' },
          validate: (value: string | null | undefined) =>
            !value || /^#[0-9a-f]{6}$/i.test(value) || 'Формат #rrggbb',
        },
        { name: 'sku', label: 'Артикул', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fullPrice',
          label: 'Повна ціна, грн',
          type: 'number',
          // Checked here instead of `required`, which would make the column NOT NULL.
          validate: (value: number | null | undefined) =>
            typeof value === 'number' || 'Вкажіть повну ціну',
          min: 0,
          admin: {
            description:
              'РРЦ: щітки – ціна постачальника мінус 1 грн, Invisibobble – як у постачальника',
          },
        },
        {
          name: 'discountPercent',
          label: 'Знижка, %',
          type: 'number',
          min: 0,
          max: 90,
          admin: { description: 'Порожньо – знижка з «Налаштувань магазину», 0 – без знижки' },
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
    { name: 'images', label: 'Фото', type: 'upload', relationTo: 'media', hasMany: true },
    tagsField('Порожньо – ярлики категорії'),
    {
      name: 'description',
      label: 'Опис',
      type: 'richText',
      localized: true,
      admin: { description: 'Порожньо – опис товарів із категорії' },
    },
    specsField(
      'Порожньо – характеристики з категорії. Бренд і країна бренду додаються автоматично.',
    ),
    metaField,
  ],
}
