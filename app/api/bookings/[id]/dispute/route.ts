import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { sendDisputeOpenedEmails } from "@/lib/notifications/booking-lifecycle";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const VALID_REASONS = ["damage", "missing_items", "manual"] as const;
const VALID_USER_REASON_CODES = [
  "damage",
  "missing_items",
  "item_not_as_described",
  "late_return",
  "non_return",
  "item_not_working",
  "handoff_conflict",
  "policy_violation",
  "payment_issue",
  "communication_issue",
  "manual",
] as const;

/** POST: open a dispute (renter, lender, or admin). Enforces return dispute window policy. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!booking || !user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to open a dispute", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  const allowedStatuses = ["RETURNED", "IN_DISPUTE", "COMPLETED", "DISPUTE"];
  if (!allowedStatuses.includes(booking.status)) {
    return NextResponse.json(
      { error: "ניתן לפתוח מחלוקת רק להזמנה פעילה, שהושלמה או שכבר במחלוקת." },
      { status: 400 }
    );
  }

  const existing = await prisma.dispute.findUnique({ where: { bookingId } });
  if (existing) {
    return NextResponse.json(
      { error: "קיימת כבר מחלוקת להזמנה זו.", disputeId: existing.id },
      { status: 409 }
    );
  }

  if (booking.status === "RETURNED" && booking.disputeWindowEndsAt) {
    const now = Date.now();
    if (new Date(booking.disputeWindowEndsAt).getTime() < now) {
      return NextResponse.json(
        { error: "חלון הזמן לפתיחת מחלוקת (48 שעות) הסתיים." },
        { status: 400 }
      );
    }
  }

  let body: {
    reason?: string;
    userReasonCode?: string;
    note?: string;
    evidenceChecklist?: string[];
    evidenceSummary?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reason = (body.reason ?? "manual").trim().toLowerCase();
  if (body.reason && !VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json(
      { error: "reason must be one of: damage, missing_items, manual" },
      { status: 400 }
    );
  }
  const userReasonCode = (body.userReasonCode ?? reason).trim().toLowerCase();
  if (!VALID_USER_REASON_CODES.includes(userReasonCode as (typeof VALID_USER_REASON_CODES)[number])) {
    return NextResponse.json(
      { error: "userReasonCode is invalid" },
      { status: 400 }
    );
  }
  const legacyReason = VALID_REASONS.includes(userReasonCode as (typeof VALID_REASONS)[number])
    ? userReasonCode
    : "manual";

  const adminNote = typeof body.note === "string" ? body.note.trim() || null : null;
  const evidenceChecklist = Array.isArray(body.evidenceChecklist)
    ? body.evidenceChecklist.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const evidenceSummary =
    body.evidenceSummary && typeof body.evidenceSummary === "object"
      ? JSON.stringify(body.evidenceSummary)
      : null;

  const dispute = await prisma.dispute.create({
    data: {
      bookingId,
      reason: legacyReason,
      userReasonCode,
      status: "OPEN",
      openedByUserId: user.id,
      adminNote,
      evidenceChecklist: evidenceChecklist.length > 0 ? JSON.stringify(evidenceChecklist) : null,
      evidenceSummary,
      evidenceSubmittedAt: evidenceChecklist.length > 0 || evidenceSummary ? new Date() : null,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "IN_DISPUTE" },
  });

  await sendDisputeOpenedEmails(bookingId);
  await trackEvent({
    eventName: "dispute_opened",
    bookingId,
    userId: user.id,
    payload: { source: "manual_form", reason: legacyReason, userReasonCode },
  });

  return NextResponse.json({
    dispute: {
      id: dispute.id,
      reason: dispute.reason,
      userReasonCode: dispute.userReasonCode,
      status: dispute.status,
    },
  });
}
