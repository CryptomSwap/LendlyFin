import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { parseKycStoredRef } from "@/lib/kyc-stored-ref";
import { deleteKycS3Object } from "@/lib/kyc-s3";

export const runtime = "nodejs";

async function deleteStoredKycMedia(stored: string | null) {
  if (!stored) return;
  const parsed = parseKycStoredRef(stored);
  if (parsed?.kind === "s3") {
    await deleteKycS3Object(parsed.key);
    return;
  }
  if (stored.startsWith("/uploads/kyc/")) {
    const filePath = join(process.cwd(), "public", stored.replace(/^\//, ""));
    try {
      await unlink(filePath);
    } catch {
      // best effort retention cleanup; do not fail KYC decision.
    }
  }
}

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

    await Promise.all([
      deleteStoredKycMedia(kycMedia.selfie),
      deleteStoredKycMedia(kycMedia.id),
    ]);

    await createAuditLog({
      entityType: "KYC",
      entityId: userId,
      action: action === "approve" ? "APPROVE" : "REJECT",
      adminUserId: adminUser!.id,
      adminName: adminUser!.name ?? "Admin",
      reason: reason || null,
      targetDisplayName: targetUser.name ?? targetUser.id,
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
