import type { StaticImageData } from 'next/image'

import { catalog, type CatalogKey } from '@/shared/config'

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

// Catalog menu icons are the current site's PNGs (Pet Teezer drawn in the same style). Later they move to Payload categories.
const icons: Record<CatalogKey, StaticImageData> = {
  wetDetangler,
  carebrush,
  childrenMini,
  compactStyler,
  easyDryGo,
  ultimateStyler,
  backCombing,
  scalp,
  petTeezer,
  invisibobble,
}

export const navigation = catalog.map((item) => ({ ...item, icon: icons[item.key] }))
