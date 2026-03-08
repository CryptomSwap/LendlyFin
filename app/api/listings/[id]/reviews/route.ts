import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * GET: public summary of reviews for this listing (reviews received by the lender for this listing's bookings).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: {
      booking: { listingId },
      ...(listing.ownerId != null ? { targetUserId: listing.ownerId } : {}),
    },
    select: { rating: true },
  });

  const count = reviews.length;
  const avg =
    count > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / count
      : 0;

  return NextResponse.json({
    count,
    averageRating: Math.round(avg * 10) / 10,
  });
}
