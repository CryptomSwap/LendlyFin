import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingParticipantAccess } from "@/lib/booking-auth";

const MIN_PHOTOS = 3;

type Body = {
  accessoriesConfirmed?: boolean;
  conditionConfirmed?: boolean;
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
    prisma.pickupChecklist.findUnique({
      where: { bookingId: booking.id },
      select: {
        id: true,
        bookingId: true,
        accessoriesConfirmed: true,
        conditionConfirmed: true,
        notes: true,
        completedAt: true,
        updatedAt: true,
      },
    }),
    prisma.bookingChecklistPhoto.count({
      where: { bookingId: booking.id, type: "pickup" },
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

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Pickup checklist is only available when booking is CONFIRMED." },
      { status: 409 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const accessoriesConfirmed = !!body.accessoriesConfirmed;
  const conditionConfirmed = !!body.conditionConfirmed;
  const photoCount = await prisma.bookingChecklistPhoto.count({
    where: { bookingId: booking.id, type: "pickup" },
  });
  const notes = (body.notes ?? "").trim() || null;

  const isComplete =
    accessoriesConfirmed && conditionConfirmed && photoCount >= MIN_PHOTOS;

  const checklist = await prisma.pickupChecklist.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      accessoriesConfirmed,
      conditionConfirmed,
      notes,
      completedAt: isComplete ? new Date() : null,
    },
    update: {
      accessoriesConfirmed,
      conditionConfirmed,
      notes,
      completedAt: isComplete ? new Date() : null,
    },
    select: {
      id: true,
      bookingId: true,
      accessoriesConfirmed: true,
      conditionConfirmed: true,
      notes: true,
      completedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ checklist: { ...checklist, photoCount }, isComplete, MIN_PHOTOS });
}
