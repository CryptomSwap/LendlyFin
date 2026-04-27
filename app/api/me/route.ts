import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { measurePerf } from "@/lib/perf";

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
  return measurePerf("api.me.GET", async () => {
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

    const [completedBookingsCount, reviewsAggregate] = await Promise.all([
      prisma.booking.count({
        where: {
          listing: { ownerId: user.id },
          status: "COMPLETED",
        },
      }),
      prisma.review.aggregate({
        where: { targetUserId: user.id },
        _count: { id: true },
        _avg: { rating: true },
      }),
    ]);

    const reviewsCount = reviewsAggregate._count.id;
    const averageRating = Math.round((reviewsAggregate._avg.rating ?? 0) * 10) / 10;

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
  });
}
