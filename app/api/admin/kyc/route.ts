import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { buildKycFileProxyUrl } from "@/lib/kyc-stored-ref";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    // Get users that require admin handling.
    // Include PENDING/IN_PROGRESS so admins can approve real users
    // even if they did not complete the legacy upload flow.
    const pendingKycUsers = await prisma.user.findMany({
      where: {
        kycStatus: { in: ["PENDING", "IN_PROGRESS", "SUBMITTED", "REJECTED"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
        kycSelfieUrl: true,
        kycIdUrl: true,
        kycSubmittedAt: true,
        kycRejectedReason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      users: pendingKycUsers.map((user) => ({
        ...user,
        kycSelfieUrl: user.kycSelfieUrl
          ? buildKycFileProxyUrl(user.id, "selfie")
          : null,
        kycIdUrl: user.kycIdUrl ? buildKycFileProxyUrl(user.id, "id") : null,
      })),
    });
  } catch (err) {
    console.error("Error fetching pending KYC:", err);
    return NextResponse.json(
      { error: "Failed to fetch pending KYC requests" },
      { status: 500 }
    );
  }
}
