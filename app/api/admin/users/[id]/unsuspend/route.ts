import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

/** POST: unsuspend user */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id: targetUserId } = await ctx.params;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, suspendedAt: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!targetUser.suspendedAt) {
    return NextResponse.json(
      { error: "User is not suspended" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      suspendedAt: null,
      suspensionReason: null,
    },
  });

  await createAuditLog({
    entityType: "USER",
    entityId: targetUserId,
    action: "unsuspend",
    adminUserId: adminUser!.id,
    adminName: adminUser!.name,
    targetDisplayName: targetUser.name,
  });

  return NextResponse.json({
    success: true,
    message: "User unsuspended",
  });
}
