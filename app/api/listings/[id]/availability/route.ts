import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

function canManageListing(listing: { ownerId: string | null }, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  if (listing.ownerId && listing.ownerId === userId) return true;
  return false;
}

/**
 * GET: Owner/admin only. Returns blocked ranges and bookings for the listing
 * so the calendar can visualize booked, blocked, and available dates.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = !!user.isAdmin;
  if (!canManageListing(listing, user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [blockedRanges, bookings] = await Promise.all([
    prisma.listingBlockedRange.findMany({
      where: { listingId: id },
      orderBy: { startDate: "asc" },
      select: { id: true, startDate: true, endDate: true },
    }),
    prisma.booking.findMany({
      where: { listingId: id },
      select: { id: true, startDate: true, endDate: true, status: true },
    }),
  ]);

  return NextResponse.json({
    blockedRanges: blockedRanges.map((r) => ({
      id: r.id,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
    bookings: bookings.map((b) => ({
      id: b.id,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      status: b.status,
    })),
  });
}
