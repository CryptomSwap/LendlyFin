import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";

export const runtime = "nodejs";

const TERMINAL_BOOKING_STATUSES: import("@prisma/client").BookingStatus[] = [
  "COMPLETED",
  "CANCELLED",
];

export async function DELETE() {
  const { error, user } = await requireUser();
  if (error) return error;

  const userId = user!.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isAdmin: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (dbUser.isAdmin) {
    return NextResponse.json(
      { error: "לא ניתן למחוק חשבון מנהל. פנה למנהל אחר." },
      { status: 403 }
    );
  }

  const userListings = await prisma.listing.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const listingIds = userListings.map((l) => l.id);

  const activeAsRenter = await prisma.booking.count({
    where: {
      userId,
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
        error: `לא ניתן למחוק את החשבון – יש ${activeAsRenter + activeOnListings} הזמנות פעילות. סיים או בטל אותן תחילה.`,
      },
      { status: 409 }
    );
  }

  const renterBookingIds = (
    await prisma.booking.findMany({
      where: { userId },
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
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
