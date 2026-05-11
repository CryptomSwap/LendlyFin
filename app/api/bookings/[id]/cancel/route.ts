import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { getActivePolicyConfig } from "@/lib/policy-config";
import {
  canCancelBooking,
  mapCancelStatus,
  computeCancellationPenalty,
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

  let body: { actor?: "renter" | "owner"; reasonCode?: string; note?: string };
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

  if (booking.status === "CANCELLED_BY_RENTER" || booking.status === "CANCELLED_BY_OWNER") {
    return NextResponse.json({
      bookingStatus: booking.status,
      penaltyAmount: booking.cancellationPenaltyAmount ?? 0,
      refundAmount: booking.refundAmount ?? 0,
      policyVersion: booking.policyVersion ?? "default-v1",
      idempotent: true,
    });
  }

  if (!canCancelBooking(booking.status)) {
    return NextResponse.json({ error: "Booking cannot be cancelled in current status." }, { status: 409 });
  }

  const policy = await getActivePolicyConfig();
  const penaltyAmount = computeCancellationPenalty({
    now: new Date(),
    startDate: booking.startDate,
    totalDue: booking.totalDue ?? 0,
    depositAmount: booking.depositAmount ?? 0,
    cancelPenaltyWindowHours: booking.cancelWindowHoursSnapshot ?? policy.cancelPenaltyWindowHours,
  });
  const refundAmount = Math.max(0, (booking.totalDue ?? 0) - penaltyAmount);
  const bookingStatus = mapCancelStatus(actor);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: bookingStatus,
      cancelledAt: new Date(),
      cancelledByUserId: user.id,
      cancellationReasonCode: body.reasonCode?.trim() || null,
      cancellationNote: body.note?.trim() || null,
      cancellationPenaltyAmount: penaltyAmount,
      refundAmount,
    },
    select: {
      status: true,
      cancellationPenaltyAmount: true,
      refundAmount: true,
      policyVersion: true,
    },
  });

  await trackEvent({
    eventName: "booking_cancelled",
    bookingId,
    userId: user.id,
    payload: { actor, reasonCode: body.reasonCode ?? null, penaltyAmount, refundAmount },
  });

  return NextResponse.json({
    bookingStatus: updated.status,
    penaltyAmount: updated.cancellationPenaltyAmount ?? 0,
    refundAmount: updated.refundAmount ?? 0,
    policyVersion: updated.policyVersion ?? policy.version,
  });
}
