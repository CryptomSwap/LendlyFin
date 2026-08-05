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

const TERMINAL_BOOKING_STATUSES: import("@prisma/client").BookingStatus[] = ["COMPLETED", "CANCELLED"];

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id: targetUserId } = await ctx.params;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, isAdmin: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (targetUser.isAdmin) {
    return NextResponse.json(
      { error: "לא ניתן למחוק משתמש מנהל" },
      { status: 403 }
    );
  }

  const userListings = await prisma.listing.findMany({
    where: { ownerId: targetUserId },
    select: { id: true },
  });
  const listingIds = userListings.map((l) => l.id);

  const activeAsRenter = await prisma.booking.count({
    where: {
      userId: targetUserId,
      status: { notIn: TERMINAL_BOOKING_STATUSES },
    },
  });
  const activeOnListings =
    listingIds.length > 0
      ? await prisma.booking.count({
          where: {
            listingId: { in: listingIds },
            status: { notIn: TERMINAL_BOOKING_STATUSES },
          },
        })
      : 0;

  if (activeAsRenter + activeOnListings > 0) {
    return NextResponse.json(
      {
        error: `לא ניתן למחוק – יש ${activeAsRenter + activeOnListings} הזמנות פעילות`,
      },
      { status: 409 }
    );
  }

  const renterBookingIds = (
    await prisma.booking.findMany({
      where: { userId: targetUserId },
      select: { id: true },
    })
  ).map((b) => b.id);

  const listingBookingIds =
    listingIds.length > 0
      ? (
          await prisma.booking.findMany({
            where: { listingId: { in: listingIds } },
            select: { id: true },
          })
        ).map((b) => b.id)
      : [];

  const allBookingIds = [
    ...new Set([...renterBookingIds, ...listingBookingIds]),
  ];

  await prisma.$transaction([
    ...(allBookingIds.length > 0
      ? [prisma.booking.deleteMany({ where: { id: { in: allBookingIds } } })]
      : []),
    ...(listingIds.length > 0
      ? [prisma.listing.deleteMany({ where: { id: { in: listingIds } } })]
      : []),
    prisma.user.delete({ where: { id: targetUserId } }),
    prisma.auditLog.create({
      data: {
        entityType: "USER",
        entityId: targetUserId,
        action: "delete",
        adminUserId: adminUser!.id,
        adminName: adminUser!.name ?? "Admin",
        targetDisplayName: targetUser.name ?? targetUser.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
