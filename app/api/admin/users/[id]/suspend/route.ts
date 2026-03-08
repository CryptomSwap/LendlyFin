import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

/** POST: suspend user. Body: { reason?: string } */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id: targetUserId } = await ctx.params;
  let body: { reason?: string } = {};
  try {
    body = await req.json();
  } catch {
    // no body
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, suspendedAt: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.suspendedAt) {
    return NextResponse.json(
      { error: "User is already suspended" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      suspendedAt: new Date(),
      suspensionReason: body.reason?.trim() || null,
    },
  });

  await createAuditLog({
    entityType: "USER",
    entityId: targetUserId,
    action: "suspend",
    adminUserId: adminUser!.id,
    adminName: adminUser!.name,
    reason: body.reason?.trim() || null,
    targetDisplayName: targetUser.name,
  });

  return NextResponse.json({
    success: true,
    message: "User suspended",
  });
}
