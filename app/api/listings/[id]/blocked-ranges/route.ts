import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { normalizeRange } from "@/lib/availability";

export const runtime = "nodejs";

function canManageListing(listing: { ownerId: string | null }, userId: string, isAdmin: boolean) {
  if (isAdmin) return true;
  if (listing.ownerId && listing.ownerId === userId) return true;
  return false;
}

/** List blocked ranges for a listing. Owner/admin only (auth required). */
export async function GET(
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
    select: { id: true, ownerId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = !!user.isAdmin;
  if (!canManageListing(listing, user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ranges = await prisma.listingBlockedRange.findMany({
    where: { listingId: id },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({ ranges });
}

/** Add a blocked date range. Owner/admin only. */
export async function POST(
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
    select: { id: true, ownerId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAdmin = !!user.isAdmin;
  if (!canManageListing(listing, user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { startDate?: string; endDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const start = body.startDate;
  const end = body.endDate;
  if (!start || !end) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  const normalized = normalizeRange(start, end);
  if (!normalized) {
    return NextResponse.json(
      { error: "Invalid date range" },
      { status: 400 }
    );
  }

  const range = await prisma.listingBlockedRange.create({
    data: {
      listingId: id,
      startDate: normalized.startDate,
      endDate: normalized.endDate,
    },
  });

  return NextResponse.json(range);
}
