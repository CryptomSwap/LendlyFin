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
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const VALID_RESOLUTIONS = ["owner", "renter", "split"] as const;
const VALID_REASON_CODES = [
  "damage",
  "missing_parts",
  "late_return",
  "non_return",
  "item_not_as_described",
  "item_not_working",
  "handoff_conflict",
  "policy_violation",
  "evidence_insufficient",
  "other",
] as const;

/** POST: resolve dispute. Sets dispute status, resolvedAt, notes; sets booking to COMPLETED; writes audit log. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id: disputeId } = await ctx.params;

  let body: {
    resolution?: string;
    adminNote?: string;
    financialNote?: string;
    adminReasonCode?: string;
    decisionRationale?: string;
    evidenceChecklist?: string[];
  };
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
  const adminReasonCode = (body.adminReasonCode ?? "").trim().toLowerCase();
  if (!VALID_REASON_CODES.includes(adminReasonCode as (typeof VALID_REASON_CODES)[number])) {
    return NextResponse.json(
      { error: "adminReasonCode must be one of the supported dispute reason codes" },
      { status: 400 }
    );
  }
  const decisionRationale =
    typeof body.decisionRationale === "string" ? body.decisionRationale.trim() : "";
  if (!decisionRationale) {
    return NextResponse.json({ error: "נדרש נימוק החלטה מפורט." }, { status: 400 });
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
  const financialNote =
    typeof body.financialNote === "string" ? body.financialNote.trim() || null : null;
  if (resolution === "split" && !financialNote) {
    return NextResponse.json({ error: "בפיצול נדרשת הערת פעולה פיננסית." }, { status: 400 });
  }
  if ((resolution === "owner" || resolution === "renter") && !financialNote) {
    return NextResponse.json(
      { error: "לשחרור פיקדון נדרשת הערת פעולה פיננסית." },
      { status: 400 }
    );
  }
  const evidenceChecklist = Array.isArray(body.evidenceChecklist)
    ? body.evidenceChecklist.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const resolutionNote = decisionRationale;
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
      adminReasonCode,
      resolutionOutcome: resolution,
      financialActionNote: financialNote ?? undefined,
      evidenceChecklist: JSON.stringify(evidenceChecklist),
      resolvedByAdminId: adminUser!.id,
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
    reason: `${adminReasonCode}${resolutionNote ? ` | ${resolutionNote}` : ""}`,
    targetDisplayName: dispute.booking.listing.title,
  });
  await prisma.adminActionRecord.create({
    data: {
      bookingId: dispute.bookingId,
      disputeId,
      action: `DISPUTE_RESOLVED_${resolution.toUpperCase()}`,
      note:
        [
          `reason=${adminReasonCode}`,
          `outcome=${resolution}`,
          `rationale=${decisionRationale}`,
          `financial=${financialNote ?? ""}`,
          `evidence=${evidenceChecklist.join(",")}`,
          adminNote ? `note=${adminNote}` : "",
        ]
          .filter(Boolean)
          .join(" | ") || null,
      adminUserId: adminUser!.id,
    },
  });

  await sendDisputeResolvedEmails(dispute.bookingId);
  await trackEvent({
    eventName: "dispute_resolved",
    bookingId: dispute.bookingId,
    userId: adminUser!.id,
    payload: {
      resolution,
      reasonCode: adminReasonCode,
      rationale: decisionRationale,
      financialNote: financialNote ?? undefined,
      evidenceChecklist,
    },
  });
  await trackEvent({
    eventName: "admin_action_recorded",
    bookingId: dispute.bookingId,
    userId: adminUser!.id,
    payload: { action: "dispute_resolve", resolution },
  });
  await trackEvent({
    eventName: "booking_completed",
    bookingId: dispute.bookingId,
    userId: adminUser!.id,
    payload: { source: "dispute_resolution" },
  });

  return NextResponse.json({
    success: true,
    dispute: { id: disputeId, status: newStatus, resolvedAt: now },
    bookingStatus: "COMPLETED",
  });
}
