import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { getActivePolicyConfig } from "@/lib/policy-config";
import {
  canMarkNoShow,
  mapNoShowStatus,
  computeNoShowPenalty,
} from "@/lib/booking-lifecycle-policy";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!booking || !user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { actor?: "renter" | "owner"; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const actor = body.actor;
  if (actor !== "renter" && actor !== "owner") {
    return NextResponse.json({ error: "actor must be renter or owner" }, { status: 400 });
  }

  const isRenter = booking.userId === user.id;
  const isOwner = booking.listing?.ownerId != null && booking.listing.ownerId === user.id;
  const isAdmin = !!user.isAdmin;
  if ((actor === "renter" && !isRenter && !isAdmin) || (actor === "owner" && !isOwner && !isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status === "NO_SHOW_RENTER" || booking.status === "NO_SHOW_OWNER") {
    return NextResponse.json({
      bookingStatus: booking.status,
      penaltyAmount: booking.cancellationPenaltyAmount ?? 0,
      idempotent: true,
    });
  }
  if (!canMarkNoShow(booking.status)) {
    return NextResponse.json({ error: "Booking cannot be marked as no-show in current status." }, { status: 409 });
  }

  const policy = await getActivePolicyConfig();
  const penaltyAmount = computeNoShowPenalty({
    noShowPenaltyMode: policy.noShowPenaltyMode,
    totalDue: booking.totalDue ?? 0,
    depositAmount: booking.depositAmount ?? 0,
  });
  const bookingStatus = mapNoShowStatus(actor);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: bookingStatus,
      noShowMarkedAt: new Date(),
      noShowMarkedByUserId: user.id,
      noShowReason: body.note?.trim() || null,
      cancellationPenaltyAmount: penaltyAmount,
      refundAmount: Math.max(0, (booking.totalDue ?? 0) - penaltyAmount),
    },
    select: {
      status: true,
      cancellationPenaltyAmount: true,
      policyVersion: true,
    },
  });

  await trackEvent({
    eventName: "booking_no_show_marked",
    bookingId,
    userId: user.id,
    payload: { actor, penaltyAmount },
  });

  return NextResponse.json({
    bookingStatus: updated.status,
    penaltyAmount: updated.cancellationPenaltyAmount ?? 0,
    policyVersion: updated.policyVersion ?? policy.version,
  });
}
