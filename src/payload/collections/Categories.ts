import type { CollectionConfig, Where } from 'payload'
import { slugField } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { contentEditors } from '../access'
import { faqItemFields, metaField, specsField, tagsField } from '../fields'

// How a category lists its products; values match ProductGrid's `view` (ProductListView).
const productViewOptions = [
  { label: 'Серії з вибором кольору', value: 'groups' },
  { label: 'Кожен колір окремою карткою', value: 'grid' },
]

// Catalog menu icons; files are in src/widgets/header/ui/nav-icons, keys match its navIcons.
const navIconOptions = [
  { label: 'The Ultimate Detangler', value: 'wet-detangler' },
  { label: 'The Complete Carebrush', value: 'carebrush' },
  { label: 'Children Mini', value: 'children-mini' },
  { label: 'Compact Styler', value: 'compact-styler' },
  { label: 'Easy Dry & Go', value: 'easy-dry-go' },
  { label: 'The Ultimate Styler', value: 'ultimate-styler' },
  { label: 'Back Combing', value: 'back-combing' },
  { label: 'The Scalp Exfoliator', value: 'scalp' },
  { label: 'Pet Teezer', value: 'pet-teezer' },
  { label: 'Invisibobble', value: 'invisibobble' },
]

// A category with a parent is a subcategory: one series (The Ultimate Detangler Large), whose colours are
// its products. A category without subcategories holds the colours of its only series itself. Every
// category has its own page at the site root.
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категорія', plural: 'Категорії' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'slug', 'order'],
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
      name: 'parent',
      label: 'Батьківська категорія',
      type: 'relationship',
      relationTo: 'categories',
      // One level: a subcategory cannot be a parent, and a category is not its own parent.
      filterOptions: ({ id }): Where => {
        const conditions: Where[] = [{ parent: { exists: false } }]
        if (id) conditions.push({ id: { not_equals: id } })
        return { and: conditions }
      },
      admin: { position: 'sidebar', description: 'Заповнюється в підкатегорії (серії)' },
    },
    {
      name: 'seriesName',
      label: 'Коротка назва серії',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Бейдж на картці й кнопка фільтра в батьківській категорії: «Large»',
      },
    },
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
      fields: faqItemFields,
    },
    {
      name: 'productInfo',
      label: 'Спільне для товарів',
      type: 'group',
      admin: {
        description:
          'Для товарів саме цієї категорії (кольорів серії); товар може задати своє замість цього',
      },
      fields: [
        tagsField('Ярлики на картці серії, наприклад «Вологе й сухе волосся»'),
        {
          name: 'description',
          label: 'Опис товару',
          type: 'richText',
          localized: true,
          admin: { description: 'Опис на сторінці кожного кольору' },
        },
        specsField(
          'Таблиця на сторінці кожного кольору. Бренд і країна бренду додаються автоматично.',
        ),
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Порядок у меню, на головній і серед серій категорії',
      },
    },
    {
      name: 'navTitle',
      label: 'Назва в меню',
      type: 'textarea',
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'Коротко, у два рядки (перенос – Enter); порожньо – повна назва',
      },
    },
    {
      name: 'navIcon',
      label: 'Іконка в меню',
      type: 'select',
      options: navIconOptions,
      admin: {
        position: 'sidebar',
        description: 'Категорія з іконкою показується в меню каталогу',
      },
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
      name: 'productView',
      label: 'Вигляд списку товарів',
      type: 'select',
      defaultValue: 'groups',
      options: productViewOptions,
      admin: {
        position: 'sidebar',
        description:
          'На сторінці категорії; покупець може перемкнути. Окремі картки зручніші, коли серій 1–2',
      },
    },
    {
      name: 'homeProductView',
      label: 'Вигляд на головній',
      type: 'select',
      defaultValue: 'groups',
      options: productViewOptions,
      admin: {
        position: 'sidebar',
        description: 'Блок категорії на головній (якщо його показано)',
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
    metaField,
  ],
}
