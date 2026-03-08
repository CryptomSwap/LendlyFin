import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import {
  releaseDepositToOwner,
  releaseDepositToRenter,
  splitDeposit,
} from "@/lib/payments/adapter";
import { sendDisputeResolvedEmails } from "@/lib/notifications/booking-lifecycle";

export const runtime = "nodejs";

const VALID_RESOLUTIONS = ["owner", "renter", "split"] as const;

/** POST: resolve dispute. Sets dispute status, resolvedAt, notes; sets booking to COMPLETED; writes audit log. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id: disputeId } = await ctx.params;

  let body: { resolution?: string; adminNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resolution = (body.resolution ?? "").toLowerCase();
  if (!VALID_RESOLUTIONS.includes(resolution as (typeof VALID_RESOLUTIONS)[number])) {
    return NextResponse.json(
      { error: "resolution must be one of: owner, renter, split" },
      { status: 400 }
    );
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { booking: { select: { id: true, listing: { select: { title: true } } } } },
  });

  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
    return NextResponse.json(
      { error: "המחלוקת כבר נסגרה." },
      { status: 400 }
    );
  }

  const statusMap = {
    owner: "RESOLVED_OWNER" as const,
    renter: "RESOLVED_RENTER" as const,
    split: "RESOLVED_SPLIT" as const,
  };
  const newStatus = statusMap[resolution as keyof typeof statusMap];
  const adminNote = typeof body.adminNote === "string" ? body.adminNote.trim() || null : null;
  const resolutionNote = adminNote;
  const now = new Date();

  const releaseResult =
    resolution === "owner"
      ? await releaseDepositToOwner(dispute.bookingId, { setBookingCompleted: true })
      : resolution === "renter"
        ? await releaseDepositToRenter(dispute.bookingId, { setBookingCompleted: true })
        : await splitDeposit(dispute.bookingId, { setBookingCompleted: true });

  if ("error" in releaseResult) {
    return NextResponse.json({ error: releaseResult.error }, { status: 500 });
  }

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: newStatus,
      resolvedAt: now,
      adminNote: adminNote ?? undefined,
      resolutionNote: resolutionNote ?? undefined,
    },
  });

  await createAuditLog({
    entityType: "DISPUTE",
    entityId: disputeId,
    action: "resolve",
    adminUserId: adminUser!.id,
    adminName: adminUser!.name,
    reason: resolutionNote ?? undefined,
    targetDisplayName: dispute.booking.listing.title,
  });

  await sendDisputeResolvedEmails(dispute.bookingId);

  return NextResponse.json({
    success: true,
    dispute: { id: disputeId, status: newStatus, resolvedAt: now },
    bookingStatus: "COMPLETED",
  });
}
