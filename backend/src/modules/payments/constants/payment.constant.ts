/** */
export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  // REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES);

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

/** */
export const PAYMENT_PROVIDERS = {
  PAYOS: 'PAYOS',
} as const;

export const PAYMENT_PROVIDER_VALUES = Object.values(PAYMENT_PROVIDERS);

export type PaymentProvider =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];
