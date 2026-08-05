// lib/booking-status.ts
import { BookingStatus } from "@prisma/client";

export type BookingActor = "RENTER" | "LENDER" | "ADMIN" | "SYSTEM";

type TransitionRule = {
  to: BookingStatus;
  allowedActors: BookingActor[];
  // Optional guard for future rules (checklists, payments, etc.)
  guard?: (ctx: { now: Date; booking: { startDate: Date; endDate: Date } }) => boolean;
  reason?: string;
};

// Core lifecycle (Phase 19)
const RULES: Record<BookingStatus, TransitionRule[]> = {
  [BookingStatus.REQUESTED]: [
    { to: BookingStatus.CONFIRMED, allowedActors: ["LENDER", "ADMIN", "SYSTEM"], reason: "אישור הזמנה" },
    { to: BookingStatus.DISPUTE, allowedActors: ["LENDER", "RENTER", "ADMIN", "SYSTEM"], reason: "פתיחת מחלוקת" },
  ],
  [BookingStatus.CONFIRMED]: [
    {
      to: BookingStatus.ACTIVE,
      allowedActors: ["LENDER", "ADMIN", "SYSTEM"],
      // Later we’ll replace this with: “pickup checklist completed”
      guard: ({ now, booking }) => now >= new Date(booking.startDate),
      reason: "תחילת השכרה",
    },
    { to: BookingStatus.DISPUTE, allowedActors: ["LENDER", "RENTER", "ADMIN", "SYSTEM"], reason: "פתיחת מחלוקת" },
  ],
  [BookingStatus.ACTIVE]: [
    {
      to: BookingStatus.COMPLETED,
      allowedActors: ["LENDER", "ADMIN", "SYSTEM"],
      // Completion is gated by server-side return checklist now (Phase 22),
      // not by endDate timing. Timing rules can be reintroduced later if desired.
      reason: "סיום השכרה",
    },
    { to: BookingStatus.DISPUTE, allowedActors: ["LENDER", "RENTER", "ADMIN", "SYSTEM"], reason: "פתיחת מחלוקת" },
  ],
  [BookingStatus.RETURNED]: [
    { to: BookingStatus.IN_DISPUTE, allowedActors: ["LENDER", "RENTER", "ADMIN", "SYSTEM"], reason: "פתיחת מחלוקת" },
    { to: BookingStatus.COMPLETED, allowedActors: ["ADMIN", "SYSTEM"], reason: "סיום לאחר חלון מחלוקת" },
    { to: BookingStatus.NON_RETURN_PENDING, allowedActors: ["ADMIN", "SYSTEM"], reason: "סימון אי-החזרה לבדיקה" },
  ],
  [BookingStatus.IN_DISPUTE]: [],
  [BookingStatus.NON_RETURN_PENDING]: [
    { to: BookingStatus.NON_RETURN_CONFIRMED, allowedActors: ["ADMIN", "SYSTEM"], reason: "אישור אי-החזרה" },
  ],
  [BookingStatus.NON_RETURN_CONFIRMED]: [],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.DISPUTE]: [],
};

/** Whether a direct transition from one status to another is defined (no actor/guard checks). */
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  const rules = RULES[from] ?? [];
  return rules.some((r) => r.to === to);
}

export function getAllowedNextStatuses(current: BookingStatus, actor: BookingActor) {
  const rules = RULES[current] ?? [];
  return rules
    .filter((r) => r.allowedActors.includes(actor))
    .map((r) => r.to);
}

export function assertTransition(params: {
  from: BookingStatus;
  to: BookingStatus;
  actor: BookingActor;
  booking: { startDate: Date; endDate: Date };
  now?: Date;
}) {
  const { from, to, actor, booking } = params;
  const now = params.now ?? new Date();

  const rules = RULES[from] ?? [];
  const rule = rules.find((r) => r.to === to);

  if (!rule) {
    return { ok: false as const, code: "INVALID_TRANSITION", message: `לא ניתן לעבור מ-${from} ל-${to}.` };
  }

  if (!rule.allowedActors.includes(actor)) {
    return { ok: false as const, code: "FORBIDDEN_ACTOR", message: "אין לך הרשאה לבצע פעולה זו." };
  }

  if (rule.guard && !rule.guard({ now, booking })) {
    return {
      ok: false as const,
      code: "GUARD_FAILED",
      message: "אי אפשר לבצע את הפעולה כרגע (תזמון/תנאים לא מתקיימים).",
    };
  }

  return { ok: true as const };
}

/**
 * NOTE (MVP Spec):
 * Spec includes NON_RETURN_PENDING / NON_RETURN_CONFIRMED later. :contentReference[oaicite:6]{index=6}
 * We keep Phase 19 limited to the current enum in engineering state. :contentReference[oaicite:7]{index=7}
 */
