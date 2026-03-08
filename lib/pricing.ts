/**
 * Shared pricing and deposit helpers for checkout, listing display, and lender payout.
 * All amounts are in whole ILS (shekels). Mock-payment compatible.
 * Ported from Repo A (Lendly MVP) logic; Repo B convention = whole shekels.
 */

// ---------------------------------------------------------------------------
// Constants (mock-friendly; replace with env or DB later)
// ---------------------------------------------------------------------------

/** Platform service fee as decimal (e.g. 0.05 = 5%). Use 0 to disable. */
export const SERVICE_FEE_RATE = 0.05;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingSummaryInput = {
  pricePerDay: number;
  deposit: number;
  startDate: Date | string;
  endDate: Date | string;
};

export type BookingSummary = {
  days: number;
  rentalSubtotal: number;
  serviceFee: number;
  depositAmount: number;
  totalDue: number;
  lenderPayout: number;
};

// ---------------------------------------------------------------------------
// Core calculations
// ---------------------------------------------------------------------------

/**
 * Number of rental days (inclusive). Minimum 1.
 */
export function getNumberOfDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Rental subtotal = pricePerDay × days. In whole ILS.
 */
export function getRentalSubtotal(pricePerDay: number, days: number): number {
  return pricePerDay * days;
}

/**
 * Platform service fee. In whole ILS. Rounds down; use 0 rate to disable.
 */
export function getServiceFee(
  rentalSubtotal: number,
  rate: number = SERVICE_FEE_RATE
): number {
  return Math.floor(rentalSubtotal * rate);
}

/**
 * Deposit amount. For now returns listing deposit as-is (static per listing).
 * Later can plug in dynamic deposit from PORT-003 risk logic.
 */
export function getDepositAmount(listingDeposit: number): number {
  return listingDeposit;
}

/**
 * Total due from renter now = rentalSubtotal + serviceFee + depositAmount.
 * (Deposit is held, not a fee; include in "total due" for payment intent.)
 */
export function getBookingTotal(
  rentalSubtotal: number,
  depositAmount: number,
  serviceFee: number = 0
): number {
  return rentalSubtotal + serviceFee + depositAmount;
}

/**
 * What the lender receives after platform fee. In whole ILS.
 */
export function getLenderPayout(
  rentalSubtotal: number,
  serviceFeeAmount: number
): number {
  return rentalSubtotal - serviceFeeAmount;
}

/**
 * Full booking summary from listing + dates. Use in checkout summary and create-intent.
 */
export function getBookingSummary(input: BookingSummaryInput): BookingSummary {
  const days = getNumberOfDays(input.startDate, input.endDate);
  const rentalSubtotal = getRentalSubtotal(input.pricePerDay, days);
  const serviceFee = getServiceFee(rentalSubtotal);
  const depositAmount = getDepositAmount(input.deposit);
  const totalDue = getBookingTotal(rentalSubtotal, depositAmount, serviceFee);
  const lenderPayout = getLenderPayout(rentalSubtotal, serviceFee);

  return {
    days,
    rentalSubtotal,
    serviceFee,
    depositAmount,
    totalDue,
    lenderPayout,
  };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format amount in Israeli Shekels for display (e.g. "₪120" or "123.45 ₪").
 * Input in whole ILS.
 */
export function formatMoneyIls(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
