/**
 * Maps booking status to a linear "step N of total" UX (add-listing style progress).
 * Uses a fixed happy-path lane (6 steps); dispute/non-return statuses map to sensible positions.
 */

export type BookingStatusForSteps =
  | "REQUESTED"
  | "CONFIRMED"
  | "ACTIVE"
  | "RETURNED"
  | "IN_DISPUTE"
  | "NON_RETURN_PENDING"
  | "NON_RETURN_CONFIRMED"
  | "COMPLETED"
  | "DISPUTE";

/** Main journey: בקשה → אישור → פעילה → הוחזר → מחלוקת / בדיקה → הושלמה */
export const BOOKING_FLOW_TOTAL_STEPS = 6;

export function getBookingLifecycleStep(status: BookingStatusForSteps): {
  currentStep: number;
  totalSteps: number;
  label: string;
} {
  switch (status) {
    case "REQUESTED":
      return { currentStep: 1, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "בקשת הזמנה" };
    case "CONFIRMED":
      return { currentStep: 2, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "אושר והמתנה לאיסוף" };
    case "ACTIVE":
      return { currentStep: 3, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "השכרה פעילה" };
    case "RETURNED":
      return { currentStep: 4, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "הוחזר · חלון מחלוקת" };
    case "IN_DISPUTE":
    case "DISPUTE":
      return { currentStep: 5, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "מחלוקת בטיפול" };
    case "NON_RETURN_PENDING":
      return {
        currentStep: 5,
        totalSteps: BOOKING_FLOW_TOTAL_STEPS,
        label: "אי-החזרה בבדיקה",
      };
    case "NON_RETURN_CONFIRMED":
      return {
        currentStep: 5,
        totalSteps: BOOKING_FLOW_TOTAL_STEPS,
        label: "אי-החזרה אושרה",
      };
    case "COMPLETED":
      return { currentStep: 6, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "הושלמה" };
    default:
      return { currentStep: 1, totalSteps: BOOKING_FLOW_TOTAL_STEPS, label: "סטטוס לא ידוע" };
  }
}

export function getBookingProgressPercent(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(100, Math.round((currentStep / totalSteps) * 100));
}
