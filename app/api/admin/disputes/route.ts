import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET: list disputes, optional ?status= filter. */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status")?.trim();

  const where = statusFilter
    ? { status: statusFilter as "OPEN" | "UNDER_REVIEW" | "RESOLVED_OWNER" | "RESOLVED_RENTER" | "RESOLVED_SPLIT" | "CLOSED" }
    : {};

  const disputes = await prisma.dispute.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        include: {
          user: { select: { id: true, name: true } },
          listing: { select: { id: true, title: true } },
        },
      },
    },
  });

  const list = disputes.map((d) => ({
    id: d.id,
    bookingId: d.bookingId,
    reason: d.reason,
    status: d.status,
    openedByUserId: d.openedByUserId,
    resolvedAt: d.resolvedAt,
    createdAt: d.createdAt,
    listingTitle: d.booking.listing.title,
    renterName: d.booking.user.name,
    renterId: d.booking.userId,
  }));

  return NextResponse.json({ disputes: list });
}
