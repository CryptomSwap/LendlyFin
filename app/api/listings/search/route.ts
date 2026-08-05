import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { measurePerf } from "@/lib/perf";
import { checkRateLimit } from "@/lib/rate-limit";
import { listingCoverImageUrl } from "@/lib/listing-images";

export const runtime = "nodejs";

/** Public search: only ACTIVE listings are discoverable */
const PUBLIC_LISTING_STATUS = "ACTIVE" as const;

async function getReviewStatsByListing(listingIds: string[]) {
  if (listingIds.length === 0) {
    return [] as Array<{ listingId: string; reviewsCount: number; averageRating: number | null }>;
  }

  try {
    return await prisma.$queryRaw<
      Array<{ listingId: string; reviewsCount: number; averageRating: number | null }>
    >`
      SELECT b.listingId AS listingId, COUNT(r.id) AS reviewsCount, AVG(r.rating) AS averageRating
      FROM Review r
      INNER JOIN Booking b ON b.id = r.bookingId
      INNER JOIN Listing l ON l.id = b.listingId
      WHERE b.listingId IN (${Prisma.join(listingIds)}) AND r.targetUserId = l.ownerId
      GROUP BY b.listingId
    `;
  } catch (error) {
    // Review stats are non-critical; degrade gracefully on DB/schema/query issues.
    console.warn("listing-search review stats unavailable", error);
    return [] as Array<{ listingId: string; reviewsCount: number; averageRating: number | null }>;
  }
}

export async function GET(req: Request) {
  return measurePerf("api.listings.search.GET", async () => {
    const searchRate = await checkRateLimit(req, {
      keyPrefix: "listings:search",
      windowMs: 60_000,
      limit: 180,
    });
    if (!searchRate.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(searchRate.retryAfterSec) } }
      );
    }

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
  const [completedCounts, reviewStatsByListing] = await Promise.all([
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
    getReviewStatsByListing(listingIds),
  ]);

  const completedByListingId = new Map(
    completedCounts.map((c) => [c.listingId, c._count.id])
  );

  const reviewsForOwnerByListing = new Map(
    reviewStatsByListing.map((row) => [
      row.listingId,
      {
        count: Number(row.reviewsCount ?? 0),
        averageRating: Math.round(Number(row.averageRating ?? 0) * 10) / 10,
      },
    ])
  );

  const items = rawItems.map((listing) => {
    const { owner, images, ...rest } = listing;
    const completed = completedByListingId.get(listing.id) ?? 0;
    const rev = reviewsForOwnerByListing.get(listing.id);
    const reviewsCount = rev?.count ?? 0;
    const averageRating = rev?.averageRating ?? 0;
    return {
      ...rest,
      owner,
      coverImageUrl: listingCoverImageUrl(images),
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
  });
}
