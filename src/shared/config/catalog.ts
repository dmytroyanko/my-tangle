// Catalog sections in menu order. Paths are the current site's URLs; names live in messages
// (short two-line labels under Navigation, full names under Catalog).
// Later this moves to Payload categories (order, icon), keeping the same paths.
export const catalog = [
  { key: 'wetDetangler', href: '/the-wet-detangler' },
  { key: 'carebrush', href: '/the-complete-carebrush' },
  { key: 'childrenMini', href: '/the-original-children-mini' },
  { key: 'compactStyler', href: '/compact-styler' },
  { key: 'easyDryGo', href: '/easy-dry-go' },
  { key: 'ultimateStyler', href: '/the-ultimate' },
  { key: 'backCombing', href: '/back-combing-hairbrush' },
  { key: 'scalp', href: '/the-scalp-exfoliator-and-massager' },
  { key: 'invisibobble', href: '/rezinki-invisibobble' },
] as const

export type CatalogKey = (typeof catalog)[number]['key']
