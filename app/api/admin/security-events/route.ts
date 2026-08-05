import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const SECURITY_ACTIONS = [
  "RATE_LIMIT_DENIED",
  "KYC_FILE_VIEWED_ADMIN",
  "KYC_FILE_VIEWED_SELF",
  "KYC_FILE_ACCESS_DENIED",
] as const;

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const action = (searchParams.get("action") ?? "").trim();
    const limitRaw = Number(searchParams.get("limit") ?? 100);
    const limit = Math.min(300, Math.max(20, Number.isFinite(limitRaw) ? limitRaw : 100));

    const rows = await prisma.auditLog.findMany({
      where: {
        action: action
          ? action
          : {
              in: [...SECURITY_ACTIONS],
            },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      events: rows.map((r) => ({
        id: r.id,
        entityType: r.entityType,
        entityId: r.entityId,
        action: r.action,
        actor: r.adminName,
        reason: r.reason,
        targetDisplayName: r.targetDisplayName,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error fetching security events:", err);
    return NextResponse.json(
      { error: "Failed to fetch security events" },
      { status: 500 }
    );
  }
}
