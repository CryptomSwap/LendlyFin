import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { measurePerf } from "@/lib/perf";
import { checkRateLimit } from "@/lib/rate-limit";
import { mapListingImagesForApi } from "@/lib/listing-images";

export const runtime = "nodejs";

function canManageListing(listing: { ownerId: string | null }, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  if (listing.ownerId && listing.ownerId === userId) return true;
  return false;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return measurePerf("api.listingById.GET", async () => {
    const detailRate = await checkRateLimit(req, {
      keyPrefix: "listings:detail",
      windowMs: 60_000,
      limit: 180,
    });
    if (!detailRate.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(detailRate.retryAfterSec) } }
      );
    }

    const { id } = await ctx.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        owner: {
          select: { id: true, name: true, kycStatus: true, phoneNumber: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [completedBookingsCount, reviewsAgg] = await Promise.all([
      prisma.booking.count({
        where: { listingId: id, status: "COMPLETED" },
      }),
      listing.ownerId
        ? prisma.review.aggregate({
            where: {
              booking: { listingId: id },
              targetUserId: listing.ownerId,
            },
            _count: { id: true },
            _avg: { rating: true },
          })
        : null,
    ]);

    const reviewsCount = reviewsAgg?._count.id ?? 0;
    const averageRating = Math.round((reviewsAgg?._avg.rating ?? 0) * 10) / 10;

    return NextResponse.json({
      ...listing,
      images: mapListingImagesForApi(listing.images, { allowInline: true }),
      completedBookingsCount,
      reviewsCount,
      averageRating,
    });
  });
}

/** PATCH: owner/admin update listing details. Edits never re-trigger approval. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, ownerId: true, status: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = !!user.isAdmin;
  if (!canManageListing(listing, user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    title?: string;
    description?: string | null;
    category?: string;
    subcategory?: string | null;
    city?: string;
    pricePerDay?: number;
    deposit?: number;
    valueEstimate?: number | null;
    pickupNote?: string | null;
    rules?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (!t) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    updateData.title = t;
  }
  if (body.description !== undefined) {
    updateData.description = typeof body.description === "string" ? (body.description.trim() || null) : null;
  }
  if (body.category !== undefined) {
    updateData.category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
  }
  if (body.subcategory !== undefined) {
    updateData.subcategory = typeof body.subcategory === "string" ? (body.subcategory.trim().toLowerCase() || null) : null;
  }
  if (body.city !== undefined) {
    const c = typeof body.city === "string" ? body.city.trim() : "";
    if (!c) return NextResponse.json({ error: "city cannot be empty" }, { status: 400 });
    updateData.city = c;
  }
  if (body.pricePerDay !== undefined) {
    if (typeof body.pricePerDay !== "number" || body.pricePerDay < 0) {
      return NextResponse.json({ error: "pricePerDay must be a non-negative number" }, { status: 400 });
    }
    updateData.pricePerDay = Math.round(body.pricePerDay);
  }
  if (body.deposit !== undefined) {
    if (typeof body.deposit !== "number" || body.deposit < 0) {
      return NextResponse.json({ error: "deposit must be a non-negative number" }, { status: 400 });
    }
    updateData.deposit = Math.round(body.deposit);
  }
  if (body.valueEstimate !== undefined) {
    updateData.valueEstimate =
      body.valueEstimate != null && Number.isFinite(Number(body.valueEstimate))
        ? Math.round(Number(body.valueEstimate))
        : null;
  }
  if (body.pickupNote !== undefined) {
    updateData.pickupNote = typeof body.pickupNote === "string" ? (body.pickupNote.trim() || null) : null;
  }
  if (body.rules !== undefined) {
    updateData.rules = typeof body.rules === "string" ? (body.rules.trim() || null) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: updateData,
    include: {
      images: { orderBy: { order: "asc" } },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}

const TERMINAL_BOOKING_STATUSES = ["COMPLETED", "CANCELLED"];

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      bookings: { select: { id: true, status: true } },
    },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (!canManageListing(listing, user.id, !!user.isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const activeBookings = listing.bookings.filter(
    (b) => !TERMINAL_BOOKING_STATUSES.includes(b.status)
  );
  if (activeBookings.length > 0) {
    return NextResponse.json(
      { error: `לא ניתן למחוק – יש ${activeBookings.length} הזמנות פעילות` },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    ...(listing.bookings.length > 0
      ? [
          prisma.review.deleteMany({
            where: { bookingId: { in: listing.bookings.map((b) => b.id) } },
          }),
          prisma.booking.deleteMany({ where: { listingId: id } }),
        ]
      : []),
    prisma.listing.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
