import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { readKycImageFromStoredUrl } from "@/lib/kyc-files";
import { AUDIT_ENTITY, createSystemAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ userId: string; type: string }> }
) {
  const requester = await getCurrentUser();
  if (!requester) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, type } = await ctx.params;
  if (type !== "selfie" && type !== "id") {
    return NextResponse.json({ error: "Invalid KYC file type" }, { status: 400 });
  }
  if (requester.id !== userId && !requester.isAdmin) {
    void createSystemAuditLog({
      entityType: AUDIT_ENTITY.KYC,
      entityId: userId,
      action: "KYC_FILE_ACCESS_DENIED",
      reason: `requester:${requester.id}`,
      targetDisplayName: type,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycSelfieUrl: true, kycIdUrl: true },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const storedUrl = type === "selfie" ? targetUser.kycSelfieUrl : targetUser.kycIdUrl;
  if (!storedUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await readKycImageFromStoredUrl(storedUrl);
    void createSystemAuditLog({
      entityType: AUDIT_ENTITY.KYC,
      entityId: userId,
      action: requester.isAdmin ? "KYC_FILE_VIEWED_ADMIN" : "KYC_FILE_VIEWED_SELF",
      reason: `requester:${requester.id}`,
      targetDisplayName: type,
    });
    return new Response(Buffer.from(file.bytes), {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
