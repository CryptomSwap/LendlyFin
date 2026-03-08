import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { sendDisputeOpenedEmails } from "@/lib/notifications/booking-lifecycle";

export const runtime = "nodejs";

const VALID_REASONS = ["damage", "missing_items", "manual"] as const;

/** POST: open a dispute (renter, lender, or admin). Only if booking is ACTIVE, COMPLETED, or already DISPUTE. No duplicate. */
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

  const allowedStatuses = ["ACTIVE", "COMPLETED", "DISPUTE"];
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

  let body: { reason?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reason = (body.reason ?? "manual").trim().toLowerCase();
  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json(
      { error: "reason must be one of: damage, missing_items, manual" },
      { status: 400 }
    );
  }

  const adminNote = typeof body.note === "string" ? body.note.trim() || null : null;

  const dispute = await prisma.dispute.create({
    data: {
      bookingId,
      reason,
      status: "OPEN",
      openedByUserId: user.id,
      adminNote,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "DISPUTE" },
  });

  await sendDisputeOpenedEmails(bookingId);

  return NextResponse.json({ dispute: { id: dispute.id, reason: dispute.reason, status: dispute.status } });
}
