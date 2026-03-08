import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const { error, user } = await requireAdmin();
  if (error) return error;

  try {
    // Get all users with SUBMITTED KYC status
    const pendingKycUsers = await prisma.user.findMany({
      where: {
        kycStatus: "SUBMITTED",
      },
      select: {
        id: true,
        name: true,
        kycStatus: true,
        kycSelfieUrl: true,
        kycIdUrl: true,
        kycSubmittedAt: true,
        kycRejectedReason: true,
      },
      orderBy: {
        kycSubmittedAt: "desc",
      },
    });

    return NextResponse.json({ users: pendingKycUsers });
  } catch (err) {
    console.error("Error fetching pending KYC:", err);
    return NextResponse.json(
      { error: "Failed to fetch pending KYC requests" },
      { status: 500 }
    );
  }
}
