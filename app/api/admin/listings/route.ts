import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const VALID_STATUSES = ["DRAFT", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "PAUSED"] as const;

export async function GET(req: Request) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.toUpperCase();

  const where: { status?: string } = {};
  if (status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    where.status = status;
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    listings: listings.map((l) => ({
      ...l,
      ownerId: l.ownerId ?? null,
      ownerName: l.owner?.name ?? null,
    })),
  });
}
