import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
const VALID_KYC_STATUSES = ["PENDING", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"] as const;

/**
 * GET /api/admin/users
 * Query: q (search name/id), kycStatus, suspended (true|false), page, limit
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const kycStatus = searchParams.get("kycStatus")?.trim() || undefined;
  const suspendedParam = searchParams.get("suspended");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { id: { contains: q } },
    ];
  }
  if (kycStatus && VALID_KYC_STATUSES.includes(kycStatus as (typeof VALID_KYC_STATUSES)[number])) {
    where.kycStatus = kycStatus as (typeof VALID_KYC_STATUSES)[number];
  }
  if (suspendedParam === "true") {
    where.suspendedAt = { not: null };
  } else if (suspendedParam === "false") {
    where.suspendedAt = null;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
        isAdmin: true,
        suspendedAt: true,
        suspensionReason: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            listings: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Disputes opened by each user (Dispute.openedByUserId)
  const userIds = users.map((u) => u.id);
  const disputesByUser =
    userIds.length > 0
      ? await prisma.dispute.groupBy({
          by: ["openedByUserId"],
          where: { openedByUserId: { in: userIds, not: null } },
          _count: true,
        })
      : [];
  const disputesCountMap = new Map(
    disputesByUser
      .filter((d) => d.openedByUserId != null)
      .map((d) => [d.openedByUserId!, d._count])
  );

  const list = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? null,
    kycStatus: u.kycStatus ?? null,
    isAdmin: u.isAdmin,
    suspendedAt: u.suspendedAt?.toISOString() ?? null,
    suspensionReason: u.suspensionReason ?? null,
    createdAt: u.createdAt?.toISOString() ?? null,
    listingsCount: u._count.listings,
    bookingsCount: u._count.bookings,
    disputesOpenedCount: disputesCountMap.get(u.id) ?? 0,
  }));

  return NextResponse.json({
    users: list,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
