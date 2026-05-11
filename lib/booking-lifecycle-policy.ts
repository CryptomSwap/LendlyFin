import type { BookingStatus } from "@prisma/client";

type CancelActor = "renter" | "owner";
type NoShowActor = "renter" | "owner";

const CANCELLABLE_STATUSES: BookingStatus[] = ["REQUESTED", "CONFIRMED"];
const NO_SHOW_STATUSES: BookingStatus[] = ["CONFIRMED", "ACTIVE"];
const LOCKED_STATUSES: BookingStatus[] = ["NON_RETURN_PENDING", "NON_RETURN_CONFIRMED"];

export function isCancellationLocked(status: BookingStatus) {
  return LOCKED_STATUSES.includes(status);
}

export function canCancelBooking(status: BookingStatus) {
  return CANCELLABLE_STATUSES.includes(status) && !isCancellationLocked(status);
}

export function canMarkNoShow(status: BookingStatus) {
  return NO_SHOW_STATUSES.includes(status) && !isCancellationLocked(status);
}

export function mapCancelStatus(actor: CancelActor): BookingStatus {
  return actor === "owner" ? "CANCELLED_BY_OWNER" : "CANCELLED_BY_RENTER";
}

export function mapNoShowStatus(actor: NoShowActor): BookingStatus {
  return actor === "owner" ? "NO_SHOW_OWNER" : "NO_SHOW_RENTER";
}

export function computeCancellationPenalty(params: {
  now: Date;
  startDate: Date;
  totalDue: number;
  depositAmount: number;
  cancelPenaltyWindowHours: number;
}) {
  const { now, startDate, totalDue, cancelPenaltyWindowHours } = params;
  const msUntilStart = startDate.getTime() - now.getTime();
  const penaltyWindowMs = cancelPenaltyWindowHours * 60 * 60 * 1000;
  if (msUntilStart <= 0) {
    return Math.min(totalDue, Math.max(0, Math.round(totalDue * 0.5)));
  }
  if (msUntilStart <= penaltyWindowMs) {
    return Math.min(totalDue, Math.max(0, Math.round(totalDue * 0.2)));
  }
  return 0;
}

export function computeNoShowPenalty(params: {
  noShowPenaltyMode: string;
  totalDue: number;
  depositAmount: number;
}) {
  const { noShowPenaltyMode, totalDue, depositAmount } = params;
  if (noShowPenaltyMode === "FULL_DEPOSIT") return Math.max(0, depositAmount);
  if (noShowPenaltyMode === "TOTAL_DUE") return Math.max(0, totalDue);
  return Math.max(0, Math.round(depositAmount * 0.5));
}
