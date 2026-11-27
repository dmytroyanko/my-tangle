import type { StaticImageData } from 'next/image'

import type { CatalogMenuItem } from '@/entities/category'

import backCombing from '../ui/nav-icons/back-combing.png'
import carebrush from '../ui/nav-icons/carebrush.png'
import childrenMini from '../ui/nav-icons/children-mini.png'
import compactStyler from '../ui/nav-icons/compact-styler.png'
import easyDryGo from '../ui/nav-icons/easy-dry-go.png'
import invisibobble from '../ui/nav-icons/invisibobble.png'
import petTeezer from '../ui/nav-icons/pet-teezer.png'
import scalp from '../ui/nav-icons/scalp.png'
import ultimateStyler from '../ui/nav-icons/ultimate-styler.png'
import wetDetangler from '../ui/nav-icons/wet-detangler.png'

// Catalog menu icons are the current site's PNGs (Pet Teezer drawn in the same style), picked per category
// in the admin (navIcon; the keys match the options in src/payload/collections/Categories.ts).
export const navIcons: Record<CatalogMenuItem['icon'], StaticImageData> = {
  'wet-detangler': wetDetangler,
  carebrush,
  'children-mini': childrenMini,
  'compact-styler': compactStyler,
  'easy-dry-go': easyDryGo,
  'ultimate-styler': ultimateStyler,
  'back-combing': backCombing,
  scalp,
  'pet-teezer': petTeezer,
  invisibobble,
}
