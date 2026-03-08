/**
 * Payment adapter contract: Stripe-ready interface.
 * All amounts in whole ILS. Mock and future Stripe adapter implement this.
 */

export type CreateIntentResult =
  | { intentId: string; paymentLink?: string }
  | { error: string };
export type ConfirmPaymentResult = { ok: true; bookingId: string } | { error: string };
export type DepositReleaseResult = { ok: true; depositStatus: string } | { error: string };

/** Snapshot of payment/deposit state and amounts for a booking (checkout, admin, etc.). */
export type PaymentSnapshot = {
  bookingId: string;
  /** Human-readable ref for Bit/support (e.g. LND-A1B2C3). */
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
  /** Manual Bit: e.g. "MANUAL_BIT" */
  paymentMethod?: string | null;
  /** Bit payment link for redirect (or from env fallback). */
  paymentLink?: string | null;
};

export type PaymentAdapter = {
  createIntent(bookingId: string): Promise<CreateIntentResult>;
  confirmPayment(bookingId: string): Promise<ConfirmPaymentResult>;
  releaseDepositToRenter(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  releaseDepositToOwner(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  splitDeposit(bookingId: string, opts?: { setBookingCompleted?: boolean }): Promise<DepositReleaseResult>;
  getPaymentSnapshot(bookingId: string): Promise<PaymentSnapshot | null>;
};
