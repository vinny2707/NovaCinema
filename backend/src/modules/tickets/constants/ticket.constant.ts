/** */
export const TICKET_STATUSES = {
  VALID: 'VALID',
  USED: 'USED',
  // EXPIRED: 'EXPIRED',
  // REFUNDED: 'REFUNDED',
} as const;

export const TICKET_STATUS_VALUES = Object.values(TICKET_STATUSES);

export type TicketStatus =
  (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES];
