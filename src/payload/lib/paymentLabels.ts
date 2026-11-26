import type { PaymentMethod } from '@/shared/config'

// Payment methods as the admin and the new-order notifications name them.
export const paymentLabels: Record<PaymentMethod, string> = {
  wallet: 'Apple Pay / Google Pay',
  card: 'Карткою за реквізитами',
  cod: 'Післяплата',
}
