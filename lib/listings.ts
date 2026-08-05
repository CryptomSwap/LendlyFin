/**
 * Server-side listing helpers for homepage and other non-API usage.
 * Reuses the same query/aggregation shape as the search API for consistency.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { listingCoverImageUrl } from "@/lib/listing-images";
import { CATEGORY_SLUGS } from "@/lib/constants";

const PUBLIC_LISTING_STATUS = "ACTIVE" as const;

export type FeaturedListingItem = {
  id: string;
  title: string;
  pricePerDay: number;
  city: string;
  category: string;
  subcategory?: string | null;
  coverImageUrl: string | null;
  owner: { id: string; kycStatus: string | null; phoneNumber: string | null } | null;
  completedBookingsCount: number;
  reviewsCount: number;
  averageRating: number;
};

/**
 * Fetch newest ACTIVE listings for homepage featured section.
 * Same trust aggregation as search API (completed bookings, reviews per owner).
 */
export async function getFeaturedListings(limit: number = 6): Promise<FeaturedListingItem[]> {
  const rawItems = await prisma.listing.findMany({
    where: { status: PUBLIC_LISTING_STATUS },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: { orderBy: { order: "asc" } },
      owner: {
        select: { id: true, kycStatus: true, phoneNumber: true },
      },
    },
  });

  if (rawItems.length === 0) return [];

  const listingIds = rawItems.map((i) => i.id);
  const [completedCounts, reviewsByListing] = await Promise.all([
    prisma.booking.groupBy({
      by: ["listingId"],
      where: { listingId: { in: listingIds }, status: "COMPLETED" },
      _count: { id: true },
    }),
    (async () => {
      try {
        return await prisma.review.findMany({
          where: { booking: { listingId: { in: listingIds } } },
          select: {
            rating: true,
            targetUserId: true,
            booking: { select: { listingId: true } },
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2021" || error.code === "P2022" || error.code === "P2010") {
            return [];
          }
        }
        throw error;
      }
    })(),
  ]);

  const completedByListingId = new Map(
    completedCounts.map((c) => [c.listingId, c._count.id])
  );
  const listingOwnerId = new Map(rawItems.map((i) => [i.id, i.ownerId ?? ""]));
  const reviewsForOwnerByListing: Record<string, { count: number; sum: number }> = {};
  for (const r of reviewsByListing) {
    const lid = r.booking.listingId;
    const ownerId = listingOwnerId.get(lid);
    if (ownerId && r.targetUserId === ownerId) {
      if (!reviewsForOwnerByListing[lid]) reviewsForOwnerByListing[lid] = { count: 0, sum: 0 };
      reviewsForOwnerByListing[lid].count += 1;
      reviewsForOwnerByListing[lid].sum += r.rating;
    }
  }

  return rawItems.map((listing) => {
    const { owner, images, ...rest } = listing;
    const completed = completedByListingId.get(listing.id) ?? 0;
    const rev = reviewsForOwnerByListing[listing.id];
    const reviewsCount = rev?.count ?? 0;
    const averageRating =
      reviewsCount > 0 ? Math.round((rev!.sum / reviewsCount) * 10) / 10 : 0;
    return {
      ...rest,
      owner,
      coverImageUrl: listingCoverImageUrl(images),
      completedBookingsCount: completed,
      reviewsCount,
      averageRating,
    };
  });
}

export type CategoryListingCount = {
  slug: string;
  count: number;
};

/**
 * Count ACTIVE listings per category slug for homepage discovery UI.
 * Returns every taxonomy slug (including zeros) so the carousel stays complete.
 */
export async function getActiveListingCountsByCategory(): Promise<CategoryListingCount[]> {
  const rows = await prisma.listing.groupBy({
    by: ["category"],
    where: { status: PUBLIC_LISTING_STATUS },
    _count: { _all: true },
  });

  const countBySlug = new Map(
    rows.map((row) => [String(row.category).toLowerCase(), Number(row._count._all ?? 0)])
  );

  return CATEGORY_SLUGS.map((slug) => ({
    slug,
    count: countBySlug.get(slug) ?? 0,
  }));
}
