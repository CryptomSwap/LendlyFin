import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingParticipantAccess } from "@/lib/booking-auth";

const MIN_PHOTOS = 3;

type Body = {
  conditionConfirmed?: boolean;
  damageReported?: boolean;
  missingItemsReported?: boolean;
  notes?: string;
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { error } = await requireBookingParticipantAccess(id);
  if (error) return error;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const [checklist, photoCount] = await Promise.all([
    prisma.returnChecklist.findUnique({
      where: { bookingId: booking.id },
      select: {
        id: true,
        bookingId: true,
        conditionConfirmed: true,
        damageReported: true,
        missingItemsReported: true,
        notes: true,
        completedAt: true,
        updatedAt: true,
      },
    }),
    prisma.bookingChecklistPhoto.count({
      where: { bookingId: booking.id, type: "return" },
    }),
  ]);

  return NextResponse.json({ booking, checklist: checklist ? { ...checklist, photoCount } : null, MIN_PHOTOS });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { error } = await requireBookingParticipantAccess(id);
  if (error) return error;

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Return checklist only while ACTIVE (refined UX)
  if (booking.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Return checklist is only available when booking is ACTIVE." },
      { status: 409 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conditionConfirmed = !!body.conditionConfirmed;
  const damageReported = !!body.damageReported;
  const missingItemsReported = !!body.missingItemsReported;
  const photoCount = await prisma.bookingChecklistPhoto.count({
    where: { bookingId: booking.id, type: "return" },
  });
  const notes = (body.notes ?? "").trim() || null;

  // Completion rule (simple MVP):
  // - user confirms condition
  // - photos >= minimum
  const isComplete = conditionConfirmed && photoCount >= MIN_PHOTOS;

  const checklist = await prisma.returnChecklist.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      conditionConfirmed,
      damageReported,
      missingItemsReported,
      notes,
      completedAt: isComplete ? new Date() : null,
    },
    update: {
      conditionConfirmed,
      damageReported,
      missingItemsReported,
      notes,
      completedAt: isComplete ? new Date() : null,
    },
    select: {
      id: true,
      bookingId: true,
      conditionConfirmed: true,
      damageReported: true,
      missingItemsReported: true,
      notes: true,
      completedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ checklist: { ...checklist, photoCount }, isComplete, MIN_PHOTOS });
}
