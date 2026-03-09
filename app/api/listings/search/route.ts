import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/** Public search: only ACTIVE listings are discoverable */
const PUBLIC_LISTING_STATUS = "ACTIVE" as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Text + categorical filters
  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim().toLowerCase();
  const subcategory = (searchParams.get("subcategory") ?? "").trim().toLowerCase();

  // Raw numeric filters
  const minRaw = searchParams.get("min");
  const maxRaw = searchParams.get("max");

  // Only accept numbers that were explicitly provided
  const min =
    minRaw !== null && minRaw !== "" && Number.isFinite(Number(minRaw))
      ? Number(minRaw)
      : undefined;

  const max =
    maxRaw !== null && maxRaw !== "" && Number.isFinite(Number(maxRaw))
      ? Number(maxRaw)
      : undefined;

  // Sorting + pagination
  const sort = (searchParams.get("sort") ?? "newest").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

  // Build WHERE clause safely (no implicit filters); public search = ACTIVE only
  const where: Prisma.ListingWhereInput = {
    status: PUBLIC_LISTING_STATUS,
    ...(q
      ? {
          title: {
            contains: q,
          },
        }
      : {}),
    ...(category ? { category } : {}),
    ...(category && subcategory ? { subcategory } : {}),
    ...(min !== undefined || max !== undefined
      ? {
          pricePerDay: {
            ...(min !== undefined ? { gte: min } : {}),
            ...(max !== undefined ? { lte: max } : {}),
          },
        }
      : {}),
  };

  // Sorting
  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "price" ? { pricePerDay: "asc" } : { createdAt: "desc" };

  // Query listings with owner for trust badges
  const [rawItems, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: { id: true, kycStatus: true, phoneNumber: true },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  const listingIds = rawItems.map((i) => i.id);

  // Batch-fetch trust stats: completed bookings per listing, reviews per listing (for owner)
  const [completedCounts, reviewsByListing] = await Promise.all([
    listingIds.length > 0
      ? prisma.booking.groupBy({
          by: ["listingId"],
          where: {
            listingId: { in: listingIds },
            status: "COMPLETED",
          },
          _count: { id: true },
        })
      : [],
    listingIds.length > 0
      ? prisma.review.findMany({
          where: { booking: { listingId: { in: listingIds } } },
          select: {
            rating: true,
            targetUserId: true,
            booking: { select: { listingId: true } },
          },
        })
      : [],
  ]);

  const completedByListingId = new Map(
    completedCounts.map((c) => [c.listingId, c._count.id])
  );

  const listingOwnerId = new Map(
    rawItems.map((i) => [i.id, i.ownerId ?? ""])
  );
  const reviewsForOwnerByListing: Record<
    string,
    { count: number; sum: number }
  > = {};
  for (const r of reviewsByListing) {
    const lid = r.booking.listingId;
    const ownerId = listingOwnerId.get(lid);
    if (ownerId && r.targetUserId === ownerId) {
      if (!reviewsForOwnerByListing[lid])
        reviewsForOwnerByListing[lid] = { count: 0, sum: 0 };
      reviewsForOwnerByListing[lid].count += 1;
      reviewsForOwnerByListing[lid].sum += r.rating;
    }
  }

  const items = rawItems.map((listing) => {
    const { owner, ...rest } = listing;
    const completed = completedByListingId.get(listing.id) ?? 0;
    const rev = reviewsForOwnerByListing[listing.id];
    const reviewsCount = rev?.count ?? 0;
    const averageRating =
      reviewsCount > 0 ? Math.round((rev!.sum / reviewsCount) * 10) / 10 : 0;
    return {
      ...rest,
      owner,
      completedBookingsCount: completed,
      reviewsCount,
      averageRating,
    };
  });

  return NextResponse.json({
    items,
    hasMore: page * limit < total,
    total,
    page,
    limit,
  });
}
