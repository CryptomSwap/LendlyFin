import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export const runtime = "nodejs";

const BLOCKING_STATUSES: BookingStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "ACTIVE",
];

/**
 * Public endpoint: returns unavailable date ranges for a listing.
 * No auth required — renters need this to see availability before booking.
 * Only returns opaque unavailable ranges (no booking/blocked distinction).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const [blockedRanges, bookings] = await Promise.all([
    prisma.listingBlockedRange.findMany({
      where: { listingId: id },
      orderBy: { startDate: "asc" },
      select: { startDate: true, endDate: true },
    }),
    prisma.booking.findMany({
      where: {
        listingId: id,
        status: { in: BLOCKING_STATUSES },
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  const unavailable = [
    ...blockedRanges.map((r) => ({
      start: r.startDate.toISOString().slice(0, 10),
      end: r.endDate.toISOString().slice(0, 10),
    })),
    ...bookings.map((b) => ({
      start: b.startDate.toISOString().slice(0, 10),
      end: b.endDate.toISOString().slice(0, 10),
    })),
  ];

  return NextResponse.json({ unavailable });
}
