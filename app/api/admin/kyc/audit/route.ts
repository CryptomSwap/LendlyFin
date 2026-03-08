import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rows = await prisma.auditLog.findMany({
      where: { entityType: "KYC" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    // Map to shape expected by KYC audit UI (backward-compatible)
    const logs = rows.map((r) => ({
      id: r.id,
      userId: r.adminUserId,
      targetUserId: r.entityId,
      action: r.action,
      reason: r.reason,
      adminName: r.adminName,
      targetUserName: r.targetDisplayName ?? "",
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Error fetching KYC audit logs:", err);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
