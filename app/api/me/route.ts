import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

const ME_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  phoneNumber: true,
  city: true,
  kycStatus: true,
  kycSelfieUrl: true,
  kycIdUrl: true,
  kycSubmittedAt: true,
  kycRejectedReason: true,
  isAdmin: true,
} as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: ME_SELECT,
  });
  if (!fullUser) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const [completedBookingsCount, reviewsReceived] = await Promise.all([
    prisma.booking.count({
      where: {
        listing: { ownerId: user.id },
        status: "COMPLETED",
      },
    }),
    prisma.review.findMany({
      where: { targetUserId: user.id },
      select: { rating: true },
    }),
  ]);

  const reviewsCount = reviewsReceived.length;
  const averageRating =
    reviewsCount > 0
      ? Math.round(
          (reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewsCount) * 10
        ) / 10
      : 0;

  return NextResponse.json(
    {
      user: {
        ...fullUser,
        completedBookingsCount,
        reviewsCount,
        averageRating,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
