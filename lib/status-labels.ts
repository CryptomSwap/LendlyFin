/**
 * Shared Hebrew labels for booking, listing, payment, and deposit statuses.
 * Use these everywhere to avoid duplicate copy and drift.
 */

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "ממתין לאישור",
  CONFIRMED: "אושרה",
  ACTIVE: "פעילה",
  COMPLETED: "הושלמה",
  DISPUTE: "מחלוקת",
};

export const BOOKING_STATUS_LABEL_DETAIL: Record<string, string> = {
  REQUESTED: "ממתין לאישור",
  CONFIRMED: "אושרה · ממתין לאיסוף",
  ACTIVE: "פעילה",
  COMPLETED: "הושלמה",
  DISPUTE: "בעיה פתוחה",
};

export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function getBookingStatusLabelDetail(status: string): string {
  return BOOKING_STATUS_LABEL_DETAIL[status] ?? BOOKING_STATUS_LABELS[status] ?? status;
}

/** Pill variant for booking status (for StatusPill). Use for consistent status badge styling. */
export type BookingStatusPillVariant = "primary" | "success" | "warning" | "danger" | "muted";

const BOOKING_STATUS_PILL_VARIANT: Record<string, BookingStatusPillVariant> = {
  REQUESTED: "warning",
  CONFIRMED: "primary",
  ACTIVE: "success",
  COMPLETED: "muted",
  DISPUTE: "danger",
};

export function getBookingStatusPillVariant(status: string): BookingStatusPillVariant {
  return BOOKING_STATUS_PILL_VARIANT[status] ?? "muted";
}

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: "טיוטה",
  PENDING_APPROVAL: "ממתין לאישור",
  ACTIVE: "פעיל",
  REJECTED: "נדחה",
  PAUSED: "מושהה",
};

export function getListingStatusLabel(status: string): string {
  return LISTING_STATUS_LABELS[status] ?? status;
}

/** Pill variant for listing status (for StatusPill). */
const LISTING_STATUS_PILL_VARIANT: Record<string, BookingStatusPillVariant> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "warning",
  REJECTED: "danger",
  PAUSED: "muted",
  DRAFT: "muted",
};

export function getListingStatusPillVariant(status: string): BookingStatusPillVariant {
  return LISTING_STATUS_PILL_VARIANT[status] ?? "muted";
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SUCCEEDED: "שולם",
  FAILED: "נכשל",
};

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (status == null) return "—";
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export const DEPOSIT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  HELD: "מוחזק",
  RELEASED_RENTER: "הוחזר לשוכר",
  RELEASED_OWNER: "הועבר לבעלים",
  SPLIT: "פיצול",
};

export function getDepositStatusLabel(status: string | null | undefined): string {
  if (status == null) return "—";
  return DEPOSIT_STATUS_LABELS[status] ?? status;
}

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  OPEN: "פתוח",
  UNDER_REVIEW: "בבדיקה",
  RESOLVED_OWNER: "הוחלט לבעלים",
  RESOLVED_RENTER: "הוחלט לשוכר",
  RESOLVED_SPLIT: "פיצול",
  CLOSED: "סגור",
};

export function getDisputeStatusLabel(status: string | null | undefined): string {
  if (status == null) return "—";
  return DISPUTE_STATUS_LABELS[status] ?? status;
}

export const DISPUTE_REASON_LABELS: Record<string, string> = {
  damage: "נזק",
  missing_items: "פריטים חסרים",
  manual: "ידני",
};

export function getDisputeReasonLabel(reason: string | null | undefined): string {
  if (reason == null) return "—";
  return DISPUTE_REASON_LABELS[reason] ?? reason;
}
