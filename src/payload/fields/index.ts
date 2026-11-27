import type { Field } from 'payload'

// Fields used by several collections, so they look and are stored the same everywhere.

// A question with its answer: the FAQ of categories, pages and the home page.
export const faqItemFields: Field[] = [
  { name: 'question', label: 'Питання', type: 'text', required: true },
  { name: 'answer', label: 'Відповідь', type: 'richText', required: true },
]

// SEO title, description and social preview of a page; empty fields fall back to the page's own texts.
export const metaField: Field = {
  name: 'meta',
  type: 'group',
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}

// Short labels on a product card, e.g. «Вологе й сухе волосся».
export const tagsField = (description: string): Field => ({
  name: 'tags',
  label: 'Ярлики',
  type: 'text',
  hasMany: true,
  localized: true,
  admin: { description },
})

// Characteristics of a product: rows shared by both languages, only the value is translated, so the list
// keeps the same order. Keys match src/entities/product/model/specKeys.ts; site labels are in messages
// (ProductSpecs).
export const specsField = (description: string): Field => ({
  name: 'specs',
  label: 'Характеристики',
  type: 'array',
  labels: { singular: 'Характеристика', plural: 'Характеристики' },
  admin: { initCollapsed: true, description },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'key',
          label: 'Характеристика',
          type: 'select',
          required: true,
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
})
