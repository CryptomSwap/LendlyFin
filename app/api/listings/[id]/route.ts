import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { measurePerf } from "@/lib/perf";

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
  return measurePerf("api.listingById.GET", async () => {
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
        ? prisma.review.aggregate({
            where: {
              booking: { listingId: id },
              targetUserId: listing.ownerId,
            },
            _count: { id: true },
            _avg: { rating: true },
          })
        : null,
    ]);

    const reviewsCount = reviewsAgg?._count.id ?? 0;
    const averageRating = Math.round((reviewsAgg?._avg.rating ?? 0) * 10) / 10;

    return NextResponse.json({
      ...listing,
      completedBookingsCount,
      reviewsCount,
      averageRating,
    });
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

  const isAdmin = !!user.isAdmin;
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
