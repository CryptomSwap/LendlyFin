/**
 * Payment adapter contract.
 * All amounts in whole ILS. MangoPay, manual Bit, and mock adapters implement this.
 */

export type CreateIntentResult =
  | { intentId: string; paymentLink?: string; checkoutUrl?: string }
  | { error: string };
export type ConfirmPaymentResult = { ok: true; bookingId: string } | { error: string };
export type DepositReleaseResult = { ok: true; depositStatus: string } | { error: string };

/** Snapshot of payment/deposit state and amounts for a booking (checkout, admin, etc.). */
export type PaymentSnapshot = {
  bookingId: string;
  /** Human-readable ref for support (e.g. LND-A1B2C3). */
  bookingRef?: string | null;
  title: string;
  startDate: string;
  endDate: string;
  rentalSubtotal: number;
  serviceFee: number;
  depositAmount: number;
  totalDue: number;
  lenderPayout: number;
  paymentStatus: string;
  depositStatus: string;
  paymentMethod?: string | null;
  /** Payment link for redirect. */
  paymentLink?: string | null;
  /** Active backend: mangopay | manual_bit | mock */
  paymentProvider?: string;
};

export type PaymentAdapter = {
  createIntent(bookingId: string): Promise<CreateIntentResult>;
  confirmPayment(bookingId: string): Promise<ConfirmPaymentResult>;
  releaseDepositToRenter(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  releaseDepositToOwner(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  splitDeposit(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  getPaymentSnapshot(bookingId: string): Promise<PaymentSnapshot | null>;
};
