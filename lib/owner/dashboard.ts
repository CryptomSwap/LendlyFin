/**
 * Owner dashboard: aggregate stats and lists for the current user as listing owner.
 * Used by app/(main)/owner/page.tsx. All data scoped to listings where ownerId = userId.
 */

import { prisma } from "@/lib/prisma";
import { getLenderPayout } from "@/lib/pricing";
import { measurePerf } from "@/lib/perf";

export interface OwnerDashboardData {
  activeListingsCount: number;
  pendingBookingRequestsCount: number;
  upcomingPickupsCount: number;
  activeRentalsCount: number;
  completedBookingsCount: number;
  /** Sum of lender payout (rental - platform fee) for completed bookings with payment SUCCEEDED. */
  earningsIls: number;
  /** Bookings requiring owner attention: pending requests or dispute states. */
  attentionBookings: AttentionBooking[];
  /** CONFIRMED bookings with startDate >= today, ordered by startDate. */
  upcomingPickups: UpcomingItem[];
  /** ACTIVE bookings with endDate >= today, ordered by endDate. */
  upcomingReturns: UpcomingItem[];
  /** User's listings with basic info. */
  listings: ListingOverviewItem[];
}

export interface AttentionBooking {
  id: string;
  bookingRef: string | null;
  status: string;
  startDate: string;
  endDate: string;
  listingTitle: string;
  renterName: string;
}

export interface UpcomingItem {
  id: string;
  bookingRef: string | null;
  startDate: string;
  endDate: string;
  listingTitle: string;
  renterName: string;
  status: string;
}

export interface ListingOverviewItem {
  id: string;
  title: string;
  status: string;
  city: string;
  pricePerDay: number;
  imageUrl: string | null;
  /** Count of bookings (any status) for this listing. */
  bookingsCount: number;
  latestBookingStatus: string | null;
  latestBookingRef: string | null;
}

export async function getOwnerDashboardData(userId: string): Promise<OwnerDashboardData> {
  return measurePerf("owner.dashboard.query", async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const listings = await prisma.listing.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        city: true,
        pricePerDay: true,
        images: {
          select: { url: true },
          orderBy: { order: "asc" },
          take: 1,
        },
        bookings: {
          select: { status: true, bookingRef: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const listingIds = listings.map((l) => l.id);
    if (listingIds.length === 0) {
      return {
        activeListingsCount: 0,
        pendingBookingRequestsCount: 0,
        upcomingPickupsCount: 0,
        activeRentalsCount: 0,
        completedBookingsCount: 0,
        earningsIls: 0,
        attentionBookings: [],
        upcomingPickups: [],
        upcomingReturns: [],
        listings: [],
      };
    }

    const [
      bookingsByStatus,
      upcomingPickups,
      upcomingReturns,
      attentionBookings,
      completedWithPayment,
    ] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { listingId: { in: listingIds } },
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      where: {
        listingId: { in: listingIds },
        status: "CONFIRMED",
        startDate: { gte: todayStart },
      },
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true } },
      },
      orderBy: { startDate: "asc" },
      take: 10,
    }),
    prisma.booking.findMany({
      where: {
        listingId: { in: listingIds },
        status: "ACTIVE",
        endDate: { gte: todayStart },
      },
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true } },
      },
      orderBy: { endDate: "asc" },
      take: 10,
    }),
    prisma.booking.findMany({
      where: {
        listingId: { in: listingIds },
        status: { in: ["REQUESTED", "IN_DISPUTE", "DISPUTE"] },
      },
      include: {
        listing: { select: { title: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.booking.findMany({
      where: {
        listingId: { in: listingIds },
        status: "COMPLETED",
        paymentStatus: "SUCCEEDED",
      },
      select: { rentalSubtotal: true, serviceFee: true },
    }),
    ]);

    const statusCounts = new Map(bookingsByStatus.map((b) => [b.status, b._count._all]));
    const activeListingsCount = listings.filter((l) => l.status === "ACTIVE").length;
    const pendingBookingRequestsCount = statusCounts.get("REQUESTED") ?? 0;
    const activeRentalsCount = statusCounts.get("ACTIVE") ?? 0;
    const completedBookingsCount = statusCounts.get("COMPLETED") ?? 0;
    const upcomingPickupsCount = upcomingPickups.length;

    const earningsIls = completedWithPayment.reduce((sum, b) => (
      sum + getLenderPayout(b.rentalSubtotal, b.serviceFee)
    ), 0);

    return {
      activeListingsCount,
      pendingBookingRequestsCount,
      upcomingPickupsCount,
      activeRentalsCount,
      completedBookingsCount,
      earningsIls,
      attentionBookings: attentionBookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        status: b.status,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        listingTitle: b.listing.title,
        renterName: b.user.name,
      })),
      upcomingPickups: upcomingPickups.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        listingTitle: b.listing.title,
        renterName: b.user.name,
        status: b.status,
      })),
      upcomingReturns: upcomingReturns.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        listingTitle: b.listing.title,
        renterName: b.user.name,
        status: b.status,
      })),
      listings: listings.map((l) => ({
        id: l.id,
        title: l.title,
        status: l.status,
        city: l.city,
        pricePerDay: l.pricePerDay,
        imageUrl: l.images[0]?.url ?? null,
        bookingsCount: l._count.bookings,
        latestBookingStatus: l.bookings[0]?.status ?? null,
        latestBookingRef: l.bookings[0]?.bookingRef ?? null,
      })),
    };
  });
}
