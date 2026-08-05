/**
 * Which payment backend is active. Explicit PAYMENTS_PROVIDER wins; otherwise inferred from env.
 */
export type PaymentProvider = "mangopay" | "manual_bit" | "mock";

export function getPaymentProvider(): PaymentProvider {
  const forced = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  if (forced === "mangopay" || forced === "manual_bit" || forced === "mock") {
    return forced;
  }
  if (process.env.MANGOPAY_CLIENT_ID?.trim()) return "mangopay";
  if (process.env.MANUAL_BIT_PAYMENT_URL?.trim()) return "manual_bit";
  return "mock";
}

export function isMangopayEnabled(): boolean {
  return getPaymentProvider() === "mangopay";
}
