import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET: admin user detail with counts and recent activity */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      kycStatus: true,
      isAdmin: true,
      suspendedAt: true,
      suspensionReason: true,
      kycSubmittedAt: true,
      kycRejectedReason: true,
      createdAt: true,
      _count: {
        select: { bookings: true, listings: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [disputesOpenedCount, recentBookings, recentListings] = await Promise.all([
    prisma.dispute.count({ where: { openedByUserId: id } }),
    prisma.booking.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        listing: { select: { id: true, title: true } },
      },
    }),
    prisma.listing.findMany({
      where: { ownerId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true },
    }),
  ]);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    kycStatus: user.kycStatus ?? null,
    isAdmin: user.isAdmin,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    suspensionReason: user.suspensionReason ?? null,
    kycSubmittedAt: user.kycSubmittedAt?.toISOString() ?? null,
    kycRejectedReason: user.kycRejectedReason ?? null,
    createdAt: user.createdAt?.toISOString() ?? null,
    bookingsCount: user._count.bookings,
    disputesOpenedCount,
    listingsCount: user._count.listings,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      listingId: b.listing.id,
      listingTitle: b.listing.title,
    })),
    recentListings: recentListings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
    })),
  });
}
