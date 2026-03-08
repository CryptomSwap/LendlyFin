import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { needsOnboarding } from "@/lib/auth/onboarding";

export const runtime = "nodejs";

/** GET: reviews for this booking. Renter, lender, or admin only. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user && needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to view reviews", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { bookingId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      targetUser: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
      authorId: r.authorId,
      authorName: r.author.name,
      targetUserId: r.targetUserId,
      targetUserName: r.targetUser.name,
    })),
  });
}

/** POST: create a review. Participants only (renter or lender; admin cannot submit). */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to leave a review", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  const isRenter = booking!.userId === user.id;
  const isLender =
    booking!.listing?.ownerId != null && booking!.listing.ownerId === user.id;
  if (!isRenter && !isLender) {
    return NextResponse.json(
      { error: "Only booking participants can leave a review" },
      { status: 403 }
    );
  }

  if (booking!.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Reviews are only allowed for completed bookings" },
      { status: 400 }
    );
  }

  const targetUserId = isRenter
    ? (booking!.listing?.ownerId ?? null)
    : booking!.userId;
  if (!targetUserId) {
    return NextResponse.json(
      { error: "Cannot determine review recipient (listing has no owner)" },
      { status: 400 }
    );
  }

  let body: { rating?: number; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rating =
    typeof body.rating === "number"
      ? body.rating
      : typeof body.rating === "string"
        ? parseInt(body.rating, 10)
        : NaN;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  const bodyText =
    typeof body.body === "string" ? body.body.trim() || null : null;

  const existing = await prisma.review.findUnique({
    where: {
      bookingId_authorId: { bookingId, authorId: user.id },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already left a review for this booking" },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      authorId: user.id,
      targetUserId,
      rating,
      body: bodyText,
    },
    include: {
      author: { select: { id: true, name: true } },
      targetUser: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    id: review.id,
    rating: review.rating,
    body: review.body,
    createdAt: review.createdAt,
    authorId: review.authorId,
    authorName: review.author.name,
    targetUserId: review.targetUserId,
    targetUserName: review.targetUser.name,
  });
}
