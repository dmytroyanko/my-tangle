import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { contentEditors } from '../access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order'],
  },
  access: {
    read: () => true,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'title', localized: true, slugify }),
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'Заголовок блоку на головній, якщо відрізняється від назви' },
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      admin: { description: 'Підзаголовок під заголовком блоку' },
    },
    {
      name: 'benefits',
      label: 'Переваги',
      type: 'array',
      // Per language, like the FAQ. Shown as a row of icons under the category heading; 4 fit one row.
      localized: true,
      maxRows: 4,
      labels: { singular: 'Перевага', plural: 'Переваги' },
      admin: {
        initCollapsed: true,
        description: 'Короткі переваги з іконками під заголовком сторінки категорії',
      },
      fields: [
        {
          name: 'icon',
          label: 'Іконка',
          type: 'select',
          required: true,
          // Keys match src/entities/category/model/benefitIcons.ts.
          options: [
            { label: 'Краплі (вологе волосся)', value: 'droplets' },
            { label: 'Шари (дворівневі зубчики)', value: 'layers' },
            { label: 'Рука (ручка, хват)', value: 'hand' },
            { label: 'Душ', value: 'shower' },
            { label: 'Блиск', value: 'sparkles' },
            { label: 'Валіза (подорожі)', value: 'luggage' },
            { label: 'Дитина', value: 'baby' },
            { label: 'Подарунок', value: 'gift' },
            { label: 'Щит (захист, оригінал)', value: 'shield' },
            { label: 'Листок (природні матеріали)', value: 'leaf' },
          ],
        },
        { name: 'title', label: 'Назва', type: 'text', required: true },
        { name: 'text', label: 'Пояснення', type: 'text' },
      ],
    },
    { name: 'description', type: 'richText', localized: true },
    {
      name: 'faq',
      label: 'Часті питання',
      type: 'array',
      // Per language, so a translation can have its own set of questions.
      localized: true,
      labels: { singular: 'Питання', plural: 'Питання' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'question', label: 'Питання', type: 'text', required: true },
        { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Порядок у меню та на головній' },
    },
    {
      name: 'brand',
      label: 'Бренд',
      type: 'select',
      defaultValue: 'tangle-teezer',
      // Keys match src/shared/config/brands.ts.
      options: [
        { label: 'Tangle Teezer', value: 'tangle-teezer' },
        { label: 'Invisibobble', value: 'invisibobble' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Бренд товарів категорії: у характеристиках і розмітці',
      },
    },
    {
      name: 'showOnHome',
      label: 'Показувати на головній',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Блок категорії з серіями на головній, у порядку поля «Порядок»',
      },
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'category',
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
