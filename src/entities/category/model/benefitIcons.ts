import {
  BabyIcon,
  DropletsIcon,
  GiftIcon,
  HandIcon,
  LayersIcon,
  LeafIcon,
  LuggageIcon,
  ShieldCheckIcon,
  ShowerHeadIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react'

// Icons an editor can pick for a category benefit. Keys are stored in Payload (Categories → benefits.icon);
// the admin labels live in src/payload/collections/Categories.ts.
export const benefitIcons = {
  droplets: DropletsIcon,
  layers: LayersIcon,
  hand: HandIcon,
  shower: ShowerHeadIcon,
  sparkles: SparklesIcon,
  luggage: LuggageIcon,
  baby: BabyIcon,
  gift: GiftIcon,
  shield: ShieldCheckIcon,
  leaf: LeafIcon,
} satisfies Record<string, LucideIcon>

export type BenefitIcon = keyof typeof benefitIcons
