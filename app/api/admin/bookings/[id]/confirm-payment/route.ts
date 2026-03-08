import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { confirmManualPayment } from "@/lib/payments/adapter";
import { createAuditLog, AUDIT_ENTITY } from "@/lib/audit";
import { sendBookingConfirmedEmails } from "@/lib/notifications/booking-lifecycle";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** POST: admin confirms manual payment (e.g. after verifying Bit). Sets payment SUCCEEDED, booking CONFIRMED, writes audit. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookingId } = await ctx.params;

  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, paymentStatus: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (existing.paymentStatus === "SUCCEEDED" && existing.status === "CONFIRMED") {
    return NextResponse.json({ ok: true, bookingId, alreadyConfirmed: true });
  }

  let body: { paymentNotes?: string };
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const result = await confirmManualPayment(bookingId, {
    adminUserId: adminUser.id,
    adminName: adminUser.name ?? "Admin",
    notes: typeof body.paymentNotes === "string" ? body.paymentNotes.trim() || undefined : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "Booking not found" ? 404 : 400 });
  }

  await createAuditLog({
    entityType: AUDIT_ENTITY.BOOKING,
    entityId: bookingId,
    action: "CONFIRM_PAYMENT",
    adminUserId: adminUser.id,
    adminName: adminUser.name ?? "Admin",
    reason: typeof body.paymentNotes === "string" ? body.paymentNotes.trim() || undefined : undefined,
    targetDisplayName: `Booking ${bookingId}`,
  });

  await sendBookingConfirmedEmails(bookingId);

  return NextResponse.json({ ok: true, bookingId: result.bookingId });
}
