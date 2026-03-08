import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingAccess } from "@/lib/booking-auth";
import { RETURN_PHOTO_ANGLES } from "@/lib/booking-auth";
import { releaseDepositToRenter } from "@/lib/payments/adapter";
import {
  sendBookingCompletedEmails,
  sendDisputeOpenedEmails,
} from "@/lib/notifications/booking-lifecycle";

export const runtime = "nodejs";

/** GET: fetch return checklist and return photos for the booking. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking } = await requireBookingAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checklist = booking.returnChecklist ?? null;
  const returnPhotos = (booking.checklistPhotos ?? []).filter((p) => p.type === "return");
  const photos = returnPhotos.map((p) => ({ angle: p.angle, url: p.url }));

  const hasAllPhotos = RETURN_PHOTO_ANGLES.every((a) =>
    photos.some((p) => p.angle === a)
  );
  const isComplete =
    !!checklist?.conditionConfirmed &&
    hasAllPhotos &&
    !!checklist.completedAt;

  return NextResponse.json({
    checklist: checklist
      ? {
          id: checklist.id,
          conditionConfirmed: checklist.conditionConfirmed,
          damageReported: checklist.damageReported,
          missingItemsReported: checklist.missingItemsReported,
          notes: checklist.notes,
          completedAt: checklist.completedAt,
          createdAt: checklist.createdAt,
          updatedAt: checklist.updatedAt,
        }
      : null,
    photos,
    requiredAngles: [...RETURN_PHOTO_ANGLES],
    isComplete,
  });
}

/** PUT: create or update return checklist. When complete without damage/missing → COMPLETED; with damage/missing → DISPUTE + create Dispute. */
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "ההזמנה חייבת להיות פעילה כדי להשלים רשימת החזרה." },
      { status: 400 }
    );
  }

  const pickupCompleted = booking.pickupChecklist?.completedAt;
  if (!pickupCompleted) {
    return NextResponse.json(
      { error: "יש להשלים קודם את רשימת האיסוף." },
      { status: 400 }
    );
  }

  let body: {
    conditionConfirmed?: boolean;
    damageReported?: boolean;
    missingItemsReported?: boolean;
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conditionConfirmed = !!body.conditionConfirmed;
  const damageReported = !!body.damageReported;
  const missingItemsReported = !!(body.missingItemsReported ?? false);
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

  const returnPhotos = await prisma.bookingChecklistPhoto.findMany({
    where: { bookingId, type: "return" },
    select: { angle: true },
  });
  const hasAllPhotos = RETURN_PHOTO_ANGLES.every((a) =>
    returnPhotos.some((p) => p.angle === a)
  );

  const canComplete = conditionConfirmed && hasAllPhotos;
  const hasIssue = damageReported || missingItemsReported;

  const checklist = await prisma.returnChecklist.upsert({
    where: { bookingId },
    create: {
      bookingId,
      conditionConfirmed,
      damageReported,
      missingItemsReported,
      notes,
      completedAt: canComplete ? new Date() : null,
    },
    update: {
      conditionConfirmed,
      damageReported,
      missingItemsReported,
      notes,
      ...(canComplete && !booking.returnChecklist?.completedAt
        ? { completedAt: new Date() }
        : {}),
    },
  });

  let newStatus: "COMPLETED" | "DISPUTE" | null = null;
  if (canComplete && checklist.completedAt) {
    newStatus = hasIssue ? "DISPUTE" : "COMPLETED";
    if (newStatus === "COMPLETED") {
      await releaseDepositToRenter(bookingId, { setBookingCompleted: true });
      if (booking.status === "ACTIVE") {
        await sendBookingCompletedEmails(bookingId);
      }
    } else {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "DISPUTE" },
      });
      const existing = await prisma.dispute.findUnique({ where: { bookingId } });
      if (!existing) {
        const reason = damageReported && missingItemsReported
          ? "damage"
          : damageReported
            ? "damage"
            : "missing_items";
        await prisma.dispute.create({
          data: {
            bookingId,
            reason,
            status: "OPEN",
            openedByUserId: user?.id ?? null,
          },
        });
        await sendDisputeOpenedEmails(bookingId);
      }
    }
  }

  return NextResponse.json({
    checklist: {
      id: checklist.id,
      conditionConfirmed: checklist.conditionConfirmed,
      damageReported: checklist.damageReported,
      missingItemsReported: checklist.missingItemsReported,
      notes: checklist.notes,
      completedAt: checklist.completedAt,
    },
    bookingStatus: newStatus ?? booking.status,
    hasIssue,
  });
}
