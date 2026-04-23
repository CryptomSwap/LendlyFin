/**
 * Owner dashboard: aggregate stats and lists for the current user as listing owner.
 * Used by app/(main)/owner/page.tsx. All data scoped to listings where ownerId = userId.
 */

import { prisma } from "@/lib/prisma";
import { getLenderPayout } from "@/lib/pricing";

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

  const bookings = await prisma.booking.findMany({
    where: { listingId: { in: listingIds } },
    include: {
      listing: { select: { title: true } },
      user: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const activeListingsCount = listings.filter((l) => l.status === "ACTIVE").length;
  const pendingBookingRequestsCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const activeRentalsCount = bookings.filter((b) => b.status === "ACTIVE").length;
  const completedBookingsCount = bookings.filter((b) => b.status === "COMPLETED").length;

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const upcomingPickups = confirmedBookings.filter(
    (b) => new Date(b.startDate) >= todayStart
  );
  const upcomingPickupsCount = upcomingPickups.length;

  const attentionBookings = bookings.filter(
    (b) => b.status === "REQUESTED" || b.status === "IN_DISPUTE" || b.status === "DISPUTE"
  );

  const activeBookings = bookings.filter((b) => b.status === "ACTIVE");
  const upcomingReturns = activeBookings.filter(
    (b) => new Date(b.endDate) >= todayStart
  );

  const completedWithPayment = bookings.filter(
    (b) => b.status === "COMPLETED" && b.paymentStatus === "SUCCEEDED"
  );
  const earningsIls = completedWithPayment.reduce((sum, b) => {
    const payout = getLenderPayout(b.rentalSubtotal, b.serviceFee);
    return sum + payout;
  }, 0);

  return {
    activeListingsCount,
    pendingBookingRequestsCount,
    upcomingPickupsCount,
    activeRentalsCount,
    completedBookingsCount,
    earningsIls,
    attentionBookings: attentionBookings.slice(0, 10).map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      status: b.status,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      listingTitle: b.listing.title,
      renterName: b.user.name,
    })),
    upcomingPickups: upcomingPickups.slice(0, 10).map((b) => ({
      id: b.id,
      bookingRef: b.bookingRef,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      listingTitle: b.listing.title,
      renterName: b.user.name,
      status: b.status,
    })),
    upcomingReturns: upcomingReturns.slice(0, 10).map((b) => ({
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
}
