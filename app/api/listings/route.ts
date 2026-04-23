export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { isValidCategorySlug, isValidSubcategorySlug } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

/** Public list: only ACTIVE listings (e.g. for home/feeds) */
export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { title: "asc" },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to create a listing", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
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

  const urls = Array.isArray(imageUrls) ? imageUrls.filter((u): u is string => typeof u === "string") : [];

  const listing = await prisma.listing.create({
    data: {
      ownerId: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      category: categorySlug,
      subcategory: subcategorySlug,
      city: city.trim(),
      pricePerDay: Math.round(pricePerDay),
      deposit: Math.round(deposit),
      valueEstimate: valueEstimate != null && Number.isFinite(Number(valueEstimate)) ? Math.round(Number(valueEstimate)) : null,
      pickupNote: pickupNote?.trim() || null,
      rules: rules?.trim() || null,
      images: {
        create: urls.map((url, i) => ({ url, order: i })),
      },
    },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
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

  return NextResponse.json(listing);
}
