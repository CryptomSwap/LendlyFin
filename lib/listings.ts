/**
 * Server-side listing helpers for homepage and other non-API usage.
 * Reuses the same query/aggregation shape as the search API for consistency.
 */

import { prisma } from "@/lib/prisma";

const PUBLIC_LISTING_STATUS = "ACTIVE" as const;

export type FeaturedListingItem = {
  id: string;
  title: string;
  pricePerDay: number;
  city: string;
  category: string;
  images: { url: string }[];
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
    prisma.review.findMany({
      where: { booking: { listingId: { in: listingIds } } },
      select: {
        rating: true,
        targetUserId: true,
        booking: { select: { listingId: true } },
      },
    }),
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
}
