import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingAccess } from "@/lib/booking-auth";
import { PICKUP_PHOTO_ANGLES } from "@/lib/booking-auth";
import { sendBookingActiveEmails } from "@/lib/notifications/booking-lifecycle";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

/** GET: fetch pickup checklist and photos for the booking. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking } = await requireBookingAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checklist = booking.pickupChecklist ?? null;
  const photos = (booking.checklistPhotos ?? [])
    .filter((p) => p.type === "pickup")
    .map((p) => ({ angle: p.angle, url: p.url }));

  const hasAllPhotos = PICKUP_PHOTO_ANGLES.every((a) =>
    photos.some((p) => p.angle === a)
  );
  const isComplete =
    !!checklist?.accessoriesConfirmed &&
    !!checklist?.conditionConfirmed &&
    hasAllPhotos &&
    !!checklist.completedAt;

  return NextResponse.json({
    checklist: checklist
      ? {
          id: checklist.id,
          accessoriesConfirmed: checklist.accessoriesConfirmed,
          conditionConfirmed: checklist.conditionConfirmed,
          notes: checklist.notes,
          completedAt: checklist.completedAt,
          createdAt: checklist.createdAt,
          updatedAt: checklist.updatedAt,
        }
      : null,
    photos,
    requiredAngles: [...PICKUP_PHOTO_ANGLES],
    isComplete,
  });
}

/** PUT: create or update pickup checklist. When complete, sets completedAt and transitions booking to ACTIVE. */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "ההזמנה אינה במצב מאושר – לא ניתן לעדכן רשימת איסוף." },
      { status: 400 }
    );
  }

  let body: { accessoriesConfirmed?: boolean; conditionConfirmed?: boolean; notes?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const accessoriesConfirmed = !!body.accessoriesConfirmed;
  const conditionConfirmed = !!body.conditionConfirmed;
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  const photos = await prisma.bookingChecklistPhoto.findMany({
    where: { bookingId, type: "pickup" },
    select: { angle: true },
  });
  const hasAllPhotos = PICKUP_PHOTO_ANGLES.every((a) =>
    photos.some((p) => p.angle === a)
  );

  const canComplete = accessoriesConfirmed && conditionConfirmed && hasAllPhotos;

  const checklist = await prisma.pickupChecklist.upsert({
    where: { bookingId },
    create: {
      bookingId,
      accessoriesConfirmed,
      conditionConfirmed,
      notes,
      completedAt: canComplete ? new Date() : null,
    },
    update: {
      accessoriesConfirmed,
      conditionConfirmed,
      notes,
      ...(canComplete && !booking.pickupChecklist?.completedAt
        ? { completedAt: new Date() }
        : {}),
    },
  });

  if (canComplete && checklist.completedAt && booking.status === "CONFIRMED") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ACTIVE" },
    });
    await sendBookingActiveEmails(bookingId);
    await trackEvent({
      eventName: "pickup_checklist_submitted",
      bookingId,
      userId: user?.id ?? undefined,
    });
  } else if (canComplete && checklist.completedAt) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ACTIVE" },
    });
    await trackEvent({
      eventName: "pickup_checklist_submitted",
      bookingId,
      userId: user?.id ?? undefined,
    });
  }

  return NextResponse.json({
    checklist: {
      id: checklist.id,
      accessoriesConfirmed: checklist.accessoriesConfirmed,
      conditionConfirmed: checklist.conditionConfirmed,
      notes: checklist.notes,
      completedAt: checklist.completedAt,
    },
    bookingStatus: canComplete && checklist.completedAt ? "ACTIVE" : booking.status,
  });
}
