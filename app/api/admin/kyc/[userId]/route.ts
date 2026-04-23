import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  try {
    const { userId } = await ctx.params;
    const body = await req.json();
    const { action, reason } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const kycMedia = {
      selfie: targetUser.kycSelfieUrl,
      id: targetUser.kycIdUrl,
    };

    // Update user's KYC status and remove stored media references.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: action === "approve" ? "APPROVED" : "REJECTED",
        kycSelfieUrl: null,
        kycIdUrl: null,
        ...(action === "reject" && reason
          ? { kycRejectedReason: reason }
          : action === "approve"
          ? { kycRejectedReason: null }
          : {}),
      },
      select: {
        id: true,
        name: true,
        kycStatus: true,
        kycRejectedReason: true,
      },
    });

    const deleteLocalKycFile = async (url: string | null) => {
      if (!url || !url.startsWith("/uploads/kyc/")) return;
      const filePath = join(process.cwd(), "public", url);
      try {
        await unlink(filePath);
      } catch {
        // best effort retention cleanup; do not fail KYC decision.
      }
    };
    await Promise.all([deleteLocalKycFile(kycMedia.selfie), deleteLocalKycFile(kycMedia.id)]);

    await createAuditLog({
      entityType: "KYC",
      entityId: userId,
      action: action === "approve" ? "APPROVE" : "REJECT",
      adminUserId: adminUser.id,
      adminName: adminUser.name,
      reason: reason || null,
      targetDisplayName: targetUser.name,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `KYC ${action === "approve" ? "approved" : "rejected"} successfully`,
    });
  } catch (err) {
    console.error("Error updating KYC status:", err);
    return NextResponse.json(
      { error: "Failed to update KYC status" },
      { status: 500 }
    );
  }
}
