import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET /api/admin/metrics – admin-only platform health metrics */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    approvedKycUsers,
    pendingKycUsers,
    suspendedUsers,
    totalListings,
    activeListings,
    pendingApprovalListings,
    rejectedListings,
    pausedListings,
    draftListings,
    totalBookings,
    requestedBookings,
    confirmedBookings,
    activeBookings,
    returnedBookings,
    completedBookings,
    disputeBookings,
    totalDisputes,
    openDisputes,
    resolvedDisputes,
    recentBookings7d,
    recentListings7d,
    recentUsers7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: "APPROVED" } }),
    prisma.user.count({ where: { kycStatus: "SUBMITTED" } }),
    prisma.user.count({ where: { suspendedAt: { not: null } } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.listing.count({ where: { status: "REJECTED" } }),
    prisma.listing.count({ where: { status: "PAUSED" } }),
    prisma.listing.count({ where: { status: "DRAFT" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "REQUESTED" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count({ where: { status: "RETURNED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: { in: ["IN_DISPUTE", "DISPUTE"] } } }),
    prisma.dispute.count(),
    prisma.dispute.count({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    prisma.dispute.count({
      where: {
        status: {
          in: ["RESOLVED_OWNER", "RESOLVED_RENTER", "RESOLVED_SPLIT", "CLOSED"],
        },
      },
    }),
    prisma.booking.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const metrics = {
    users: {
      totalUsers,
      approvedKycUsers,
      pendingKycUsers,
      suspendedUsers,
    },
    listings: {
      totalListings,
      activeListings,
      pendingApprovalListings,
      rejectedListings,
      pausedListings,
      draftListings,
    },
    bookings: {
      totalBookings,
      requestedBookings,
      confirmedBookings,
      activeBookings,
      returnedBookings,
      completedBookings,
      disputeBookings,
    },
    disputes: {
      totalDisputes,
      openDisputes,
      resolvedDisputes,
    },
    recent7d: {
      recentBookings7d,
      recentListings7d,
      recentUsers7d,
    },
  };

  return NextResponse.json(metrics);
}
