export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { isValidCategorySlug, isValidSubcategorySlug } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  listingCoverImageUrl,
  mapListingImagesForApi,
  sanitizeListingImageUrls,
} from "@/lib/listing-images";

/** Public list: ACTIVE listings with cover image only (paginated). */
export async function GET(req: Request) {
  const listRate = await checkRateLimit(req, {
    keyPrefix: "listings:list",
    windowMs: 60_000,
    limit: 120,
  });
  if (!listRate.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(listRate.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const [rawItems, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ]);

  const items = rawItems.map((listing) => {
    const { images, ...rest } = listing;
    return {
      ...rest,
      coverImageUrl: listingCoverImageUrl(images),
    };
  });

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const createRate = await checkRateLimit(req, {
    keyPrefix: "listings:create",
    windowMs: 60_000,
    limit: 10,
    identifier: user.id,
  });
  if (!createRate.ok) {
    return NextResponse.json(
      { error: "Too many listing attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(createRate.retryAfterSec) } }
    );
  }

  let body: {
    title: string;
    description?: string;
    category: string;
    subcategory?: string | null;
    city: string;
    pricePerDay: number;
    deposit: number;
    valueEstimate?: number | null;
    pickupNote?: string | null;
    rules?: string | null;
    imageUrls?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, category, subcategory, city, pricePerDay, deposit, valueEstimate, pickupNote, rules, imageUrls } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!category?.trim()) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }
  if (!city?.trim()) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }
  if (typeof pricePerDay !== "number" || pricePerDay < 0) {
    return NextResponse.json({ error: "pricePerDay must be a non-negative number" }, { status: 400 });
  }
  if (typeof deposit !== "number" || deposit < 0) {
    return NextResponse.json({ error: "deposit must be a non-negative number" }, { status: 400 });
  }

  const categorySlug = category.trim().toLowerCase();
  if (!isValidCategorySlug(categorySlug)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const subcategorySlug =
    subcategory != null && String(subcategory).trim() !== ""
      ? String(subcategory).trim().toLowerCase()
      : null;
  if (subcategorySlug !== null && !isValidSubcategorySlug(categorySlug, subcategorySlug)) {
    return NextResponse.json({ error: "Invalid subcategory for this category" }, { status: 400 });
  }

  const rawUrls = Array.isArray(imageUrls) ? imageUrls.filter((u): u is string => typeof u === "string") : [];
  const urls = sanitizeListingImageUrls(rawUrls, false);

  const baseData = {
    ownerId: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    category: categorySlug,
    subcategory: subcategorySlug,
    city: city.trim(),
    pricePerDay: Math.round(pricePerDay),
    deposit: Math.round(deposit),
    valueEstimate:
      valueEstimate != null && Number.isFinite(Number(valueEstimate))
        ? Math.round(Number(valueEstimate))
        : null,
    pickupNote: pickupNote?.trim() || null,
    rules: rules?.trim() || null,
  };

  try {
    let listing;
    let imagesPersisted = true;
    try {
      listing = await prisma.listing.create({
        data: {
          ...baseData,
          images: {
            create: urls.map((url, i) => ({ url, order: i })),
          },
        },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2000" || error.code === "P2022" || error.code === "P2010") {
          imagesPersisted = false;
          listing = await prisma.listing.create({
            data: baseData,
            include: {
              images: { orderBy: { order: "asc" } },
            },
          });
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    await trackEvent({
      eventName: "listing_created",
      userId: user.id,
      payload: {
        listingId: listing.id,
        category: listing.category,
        city: listing.city,
        pricePerDay: listing.pricePerDay,
      },
    });

    const publicImages = mapListingImagesForApi(listing.images, { allowInline: true });

    return NextResponse.json({
      ...listing,
      images: publicImages,
      imagesPersisted,
    });
  } catch (error) {
    console.error("Create listing failed:", error);
    return NextResponse.json({ error: "שגיאה בשמירת המודעה" }, { status: 500 });
  }
}
