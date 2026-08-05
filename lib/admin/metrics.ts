import { prisma } from "@/lib/prisma";

export type AdminMetrics = {
  users: {
    totalUsers: number;
    approvedKycUsers: number;
    pendingKycUsers: number;
    suspendedUsers: number;
  };
  listings: {
    totalListings: number;
    activeListings: number;
    pendingApprovalListings: number;
    rejectedListings: number;
    pausedListings: number;
    draftListings: number;
  };
  bookings: {
    totalBookings: number;
    requestedBookings: number;
    confirmedBookings: number;
    activeBookings: number;
    returnedBookings: number;
    completedBookings: number;
    disputeBookings: number;
  };
  disputes: {
    totalDisputes: number;
    openDisputes: number;
    resolvedDisputes: number;
  };
  recent7d: {
    recentBookings7d: number;
    recentListings7d: number;
    recentUsers7d: number;
  };
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    usersByKyc,
    suspendedUsers,
    totalUsers,
    listingsByStatus,
    totalListings,
    bookingsByStatus,
    totalBookings,
    disputesByStatus,
    totalDisputes,
    recentBookings7d,
    recentListings7d,
    recentUsers7d,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["kycStatus"],
      _count: { _all: true },
    }),
    prisma.user.count({ where: { suspendedAt: { not: null } } }),
    prisma.user.count(),
    prisma.listing.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.listing.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.count(),
    prisma.dispute.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.dispute.count(),
    prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const kycCounts = new Map<string, number>(
    usersByKyc.map((row) => [String(row.kycStatus ?? "PENDING"), Number(row._count._all ?? 0)])
  );
  const listingCounts = new Map<string, number>(
    listingsByStatus.map((row) => [String(row.status), Number(row._count._all ?? 0)])
  );
  const bookingCounts = new Map<string, number>(
    bookingsByStatus.map((row) => [String(row.status), Number(row._count._all ?? 0)])
  );
  const disputeCounts = new Map<string, number>(
    disputesByStatus.map((row) => [String(row.status), Number(row._count._all ?? 0)])
  );

  const openDisputes =
    (disputeCounts.get("OPEN") ?? 0) + (disputeCounts.get("UNDER_REVIEW") ?? 0);
  const resolvedDisputes =
    (disputeCounts.get("RESOLVED_OWNER") ?? 0) +
    (disputeCounts.get("RESOLVED_RENTER") ?? 0) +
    (disputeCounts.get("RESOLVED_SPLIT") ?? 0) +
    (disputeCounts.get("CLOSED") ?? 0);

  return {
    users: {
      totalUsers: Number(totalUsers),
      approvedKycUsers: kycCounts.get("APPROVED") ?? 0,
      pendingKycUsers: kycCounts.get("SUBMITTED") ?? 0,
      suspendedUsers: Number(suspendedUsers),
    },
    listings: {
      totalListings: Number(totalListings),
      activeListings: listingCounts.get("ACTIVE") ?? 0,
      pendingApprovalListings: listingCounts.get("PENDING_APPROVAL") ?? 0,
      rejectedListings: listingCounts.get("REJECTED") ?? 0,
      pausedListings: listingCounts.get("PAUSED") ?? 0,
      draftListings: listingCounts.get("DRAFT") ?? 0,
    },
    bookings: {
      totalBookings: Number(totalBookings),
      requestedBookings: bookingCounts.get("REQUESTED") ?? 0,
      confirmedBookings: bookingCounts.get("CONFIRMED") ?? 0,
      activeBookings: bookingCounts.get("ACTIVE") ?? 0,
      returnedBookings: bookingCounts.get("RETURNED") ?? 0,
      completedBookings: bookingCounts.get("COMPLETED") ?? 0,
      disputeBookings: (bookingCounts.get("IN_DISPUTE") ?? 0) + (bookingCounts.get("DISPUTE") ?? 0),
    },
    disputes: {
      totalDisputes: Number(totalDisputes),
      openDisputes,
      resolvedDisputes,
    },
    recent7d: {
      recentBookings7d: Number(recentBookings7d),
      recentListings7d: Number(recentListings7d),
      recentUsers7d: Number(recentUsers7d),
    },
  };
}
