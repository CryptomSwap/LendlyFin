import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/admin";

export const runtime = "nodejs";

function canManageListing(listing: { ownerId: string | null }, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  if (listing.ownerId && listing.ownerId === userId) return true;
  return false;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      owner: {
        select: { id: true, name: true, kycStatus: true, phoneNumber: true },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [completedBookingsCount, reviewsAgg] = await Promise.all([
    prisma.booking.count({
      where: { listingId: id, status: "COMPLETED" },
    }),
    listing.ownerId
      ? prisma.review.findMany({
          where: {
            booking: { listingId: id },
            targetUserId: listing.ownerId,
          },
          select: { rating: true },
        })
      : [],
  ]);

  const reviewsCount = reviewsAgg.length;
  const averageRating =
    reviewsCount > 0
      ? Math.round(
          (reviewsAgg.reduce((s, r) => s + r.rating, 0) / reviewsCount) * 10
        ) / 10
      : 0;

  return NextResponse.json({
    ...listing,
    completedBookingsCount,
    reviewsCount,
    averageRating,
  });
}

/** PATCH: owner/admin update listing details (pickup instructions, rules). */
export async function PATCH(
  req: Request,
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

  const isAdmin = await isAdminUser(user.id);
  if (!canManageListing(listing, user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { pickupNote?: string | null; rules?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updateData: { pickupNote?: string | null; rules?: string | null } = {};
  if (body.pickupNote !== undefined) {
    updateData.pickupNote = typeof body.pickupNote === "string" ? (body.pickupNote.trim() || null) : null;
  }
  if (body.rules !== undefined) {
    updateData.rules = typeof body.rules === "string" ? (body.rules.trim() || null) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: updateData,
    include: {
      images: { orderBy: { order: "asc" } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
