/**
 * Shared Hebrew labels for booking, listing, payment, and deposit statuses.
 * Use these everywhere to avoid duplicate copy and drift.
 */

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "ממתין לאישור",
  CONFIRMED: "אושרה",
  ACTIVE: "פעילה",
  CANCELLED_BY_RENTER: "בוטלה · השוכר",
  CANCELLED_BY_OWNER: "בוטלה · המשכיר",
  NO_SHOW_RENTER: "לא הגיע · השוכר",
  NO_SHOW_OWNER: "לא הגיע · המשכיר",
  RETURNED: "הוחזר",
  IN_DISPUTE: "במחלוקת",
  NON_RETURN_PENDING: "אי-החזרה בבדיקה",
  NON_RETURN_CONFIRMED: "אי-החזרה מאושרת",
  COMPLETED: "הושלמה",
  DISPUTE: "במחלוקת",
};

export const BOOKING_STATUS_LABEL_DETAIL: Record<string, string> = {
  REQUESTED: "ממתין לאישור",
  CONFIRMED: "אושרה · ממתין לאיסוף",
  ACTIVE: "פעילה",
  CANCELLED_BY_RENTER: "בוטלה על ידי השוכר",
  CANCELLED_BY_OWNER: "בוטלה על ידי המשכיר",
  NO_SHOW_RENTER: "השוכר לא הגיע",
  NO_SHOW_OWNER: "המשכיר לא הגיע",
  RETURNED: "הוחזר · חלון מחלוקת פתוח",
  IN_DISPUTE: "מחלוקת פתוחה",
  NON_RETURN_PENDING: "אי-החזרה בבדיקה",
  NON_RETURN_CONFIRMED: "אי-החזרה אושרה",
  COMPLETED: "הושלמה",
  DISPUTE: "מחלוקת פתוחה",
};

export function getBookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function getBookingStatusLabelDetail(status: string): string {
  return BOOKING_STATUS_LABEL_DETAIL[status] ?? BOOKING_STATUS_LABELS[status] ?? status;
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

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SUCCEEDED: "שולם",
  FAILED: "נכשל",
};

export function getPaymentStatusLabel(status: string | null | undefined): string {
  if (status == null) return "—";
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
