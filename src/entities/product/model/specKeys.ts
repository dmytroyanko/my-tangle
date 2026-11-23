// Characteristics an editor can add to a product, in display order. Keys are stored in Payload
// (Products → specs.key); the admin labels live in src/payload/collections/Products.ts, the site labels in
// messages (ProductSpecs).
export const specKeys = [
  'hairType',
  'use',
  'teeth',
  'size',
  'finish',
  'features',
  'length',
  'weight',
] as const

export type SpecKey = (typeof specKeys)[number]

export type ProductSpec = { key: SpecKey; value: string }
