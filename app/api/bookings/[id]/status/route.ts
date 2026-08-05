import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { assertTransition, BookingActor, getAllowedNextStatuses } from "@/lib/booking_status";
import { requireBookingParticipantAccess } from "@/lib/booking-auth";
import { isAdminUser } from "@/lib/admin";

type Body = {
  nextStatus?: BookingStatus;
};

function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && (Object.values(BookingStatus) as string[]).includes(value);
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { error, booking } = await requireBookingParticipantAccess(id);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      listingId: booking.listingId,
      userId: booking.userId,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { error, booking, user } = await requireBookingParticipantAccess(id);
  if (error) return error;
  if (!booking || !user) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nextStatus } = body;

  if (!isBookingStatus(nextStatus)) {
    return NextResponse.json(
      { error: "nextStatus is required and must be a valid BookingStatus" },
      { status: 400 }
    );
  }

  const userIsAdmin = await isAdminUser(user.id);
  const resolvedActor: BookingActor = userIsAdmin
    ? "ADMIN"
    : booking.userId === user.id
      ? "RENTER"
      : "LENDER";

  const check = assertTransition({
    from: booking.status,
    to: nextStatus,
    actor: resolvedActor,
    booking: { startDate: booking.startDate, endDate: booking.endDate },
  });

  if (!check.ok) {
    return NextResponse.json(
      {
        error: check.message,
        code: check.code,
        from: booking.status,
        to: nextStatus,
        allowedNext: getAllowedNextStatuses(booking.status, resolvedActor),
      },
      { status: 409 }
    );
  }

  // Enforce pickup checklist gate for ACTIVE
  if (nextStatus === "ACTIVE") {
    const pickup = await prisma.pickupChecklist.findUnique({
      where: { bookingId: booking.id },
      select: { completedAt: true },
    });

    if (!pickup?.completedAt) {
      return NextResponse.json(
        {
          error: "לא ניתן להתחיל השכרה לפני השלמת רשימת האיסוף.",
          code: "PICKUP_CHECKLIST_REQUIRED",
        },
        { status: 409 }
      );
    }
  }

  // Enforce return checklist gate for COMPLETED
  if (nextStatus === "COMPLETED") {
    const ret = await prisma.returnChecklist.findUnique({
      where: { bookingId: booking.id },
      select: { completedAt: true },
    });

    if (!ret?.completedAt) {
      return NextResponse.json(
        {
          error: "לא ניתן לסיים הזמנה לפני השלמת רשימת ההחזרה.",
          code: "RETURN_CHECKLIST_REQUIRED",
        },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: nextStatus },
    select: { id: true, status: true },
  });

  return NextResponse.json({ booking: updated });
}
