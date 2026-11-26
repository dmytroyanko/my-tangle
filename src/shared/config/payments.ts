// Payment methods in the order the checkout lists them: Apple Pay / Google Pay (the default), a card
// payment by the shop's bank details, cash on delivery. Orders store these values; texts for customers are
// in messages (Checkout.payments), admin labels in the Orders collection.
export const paymentMethods = ['wallet', 'card', 'cod'] as const
export type PaymentMethod = (typeof paymentMethods)[number]
