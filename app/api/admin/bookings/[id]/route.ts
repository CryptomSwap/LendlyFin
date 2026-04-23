import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog, AUDIT_ENTITY } from "@/lib/audit";
import { trackEvent } from "@/lib/analytics";
import { finalizeElapsedReturnedBookings } from "@/lib/lifecycle/finalize-returned";

export const runtime = "nodejs";

/** GET: admin view of a booking including pickup checklist and photos. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          pricePerDay: true,
          deposit: true,
        },
      },
      pickupChecklist: true,
      returnChecklist: true,
      dispute: true,
      checklistPhotos: { orderBy: [{ type: "asc" }, { angle: "asc" }] },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}

/**
 * PATCH: admin pilot operations for lifecycle escalation/override.
 * Supported actions:
 * - mark_non_return_pending
 * - confirm_non_return
 * - complete_after_dispute_window
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, status: true, disputeWindowEndsAt: true, listing: { select: { title: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  let body: { action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();
  const note = typeof body.note === "string" ? body.note.trim() || null : null;

  if (action === "mark_non_return_pending") {
    if (booking.status !== "ACTIVE") {
      return NextResponse.json({ error: "ניתן לסמן אי-החזרה רק מהזמנה פעילה." }, { status: 400 });
    }
    await prisma.booking.update({
      where: { id },
      data: {
        status: "NON_RETURN_PENDING",
        nonReturnMarkedAt: new Date(),
        nonReturnReason: note,
      },
    });
    await prisma.adminActionRecord.create({
      data: {
        bookingId: id,
        action: "MARK_NON_RETURN_PENDING",
        note,
        adminUserId: adminUser.id,
      },
    });
    await trackEvent({
      eventName: "admin_action_recorded",
      bookingId: id,
      userId: adminUser.id,
      payload: { action: "mark_non_return_pending" },
    });
  } else if (action === "confirm_non_return") {
    if (booking.status !== "NON_RETURN_PENDING") {
      return NextResponse.json({ error: "ניתן לאשר אי-החזרה רק ממצב pending." }, { status: 400 });
    }
    await prisma.booking.update({
      where: { id },
      data: {
        status: "NON_RETURN_CONFIRMED",
        nonReturnReason: note ?? undefined,
      },
    });
    await prisma.adminActionRecord.create({
      data: {
        bookingId: id,
        action: "CONFIRM_NON_RETURN",
        note,
        adminUserId: adminUser.id,
      },
    });
    await trackEvent({
      eventName: "admin_action_recorded",
      bookingId: id,
      userId: adminUser.id,
      payload: { action: "confirm_non_return" },
    });
  } else if (action === "complete_after_dispute_window") {
    if (booking.status !== "RETURNED") {
      return NextResponse.json({ error: "ניתן להשלים אוטומטית רק מהסטטוס returned." }, { status: 400 });
    }
    if (!booking.disputeWindowEndsAt || booking.disputeWindowEndsAt.getTime() > Date.now()) {
      return NextResponse.json({ error: "חלון המחלוקת טרם הסתיים." }, { status: 400 });
    }
    const updated = await prisma.booking.updateMany({
      where: { id, status: "RETURNED" },
      data: { status: "COMPLETED" },
    });
    if (updated.count > 0) {
      await trackEvent({
        eventName: "booking_completed",
        bookingId: id,
        userId: adminUser.id,
        payload: { source: "admin_complete_after_dispute_window" },
      });
    }
    await prisma.adminActionRecord.create({
      data: {
        bookingId: id,
        action: "COMPLETE_AFTER_DISPUTE_WINDOW",
        note,
        adminUserId: adminUser.id,
      },
    });
    await trackEvent({
      eventName: "admin_action_recorded",
      bookingId: id,
      userId: adminUser.id,
      payload: { action: "complete_after_dispute_window", completionUpdated: updated.count > 0 },
    });
    await finalizeElapsedReturnedBookings({ limit: 100 });
  } else {
    return NextResponse.json(
      {
        error:
          "Unsupported action. Use: mark_non_return_pending, confirm_non_return, complete_after_dispute_window",
      },
      { status: 400 }
    );
  }

  await createAuditLog({
    entityType: AUDIT_ENTITY.BOOKING,
    entityId: id,
    action: action.toUpperCase(),
    adminUserId: adminUser.id,
    adminName: adminUser.name ?? "Admin",
    reason: note,
    targetDisplayName: booking.listing?.title ?? `Booking ${id}`,
  });

  const updated = await prisma.booking.findUnique({ where: { id } });
  return NextResponse.json({ booking: updated });
}
