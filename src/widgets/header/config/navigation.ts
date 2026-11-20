import type { StaticImageData } from 'next/image'

import backCombing from '../ui/nav-icons/back-combing.png'
import carebrush from '../ui/nav-icons/carebrush.png'
import childrenMini from '../ui/nav-icons/children-mini.png'
import compactStyler from '../ui/nav-icons/compact-styler.png'
import easyDryGo from '../ui/nav-icons/easy-dry-go.png'
import invisibobble from '../ui/nav-icons/invisibobble.png'
import scalp from '../ui/nav-icons/scalp.png'
import ultimateStyler from '../ui/nav-icons/ultimate-styler.png'
import wetDetangler from '../ui/nav-icons/wet-detangler.png'

// Catalog menu. Paths are the current site's URLs; labels live in messages under Navigation.
// Icons are the current site's PNGs. Later this moves to Payload categories (order, icon), keeping the same paths.
export type NavItem = {
  key: string
  href: string
  icon: StaticImageData
}

export const navigation: NavItem[] = [
  { key: 'wetDetangler', href: '/the-wet-detangler', icon: wetDetangler },
  { key: 'carebrush', href: '/the-complete-carebrush', icon: carebrush },
  { key: 'childrenMini', href: '/the-original-children-mini', icon: childrenMini },
  { key: 'compactStyler', href: '/compact-styler', icon: compactStyler },
  { key: 'easyDryGo', href: '/easy-dry-go', icon: easyDryGo },
  { key: 'ultimateStyler', href: '/the-ultimate', icon: ultimateStyler },
  { key: 'backCombing', href: '/back-combing-hairbrush', icon: backCombing },
  { key: 'scalp', href: '/the-scalp-exfoliator-and-massager', icon: scalp },
  { key: 'invisibobble', href: '/rezinki-invisibobble', icon: invisibobble },
]
