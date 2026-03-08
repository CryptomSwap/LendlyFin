import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("[KYC Submit] Starting KYC submission process");

    const user = await getCurrentUser();
    if (!user) {
      console.error("[KYC Submit] Unauthorized: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[KYC Submit] User authenticated:", { userId: user.id, userName: user.name, currentKycStatus: user.kycStatus });

    // Prevent re-submission if already submitted, approved, or rejected
    if (user.kycStatus === "SUBMITTED" || user.kycStatus === "APPROVED" || user.kycStatus === "REJECTED") {
      console.error("[KYC Submit] User already has KYC status:", user.kycStatus);
      return NextResponse.json(
        { error: `Cannot submit KYC: already ${user.kycStatus === "SUBMITTED" ? "submitted" : user.kycStatus === "APPROVED" ? "approved" : "rejected"}` },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[KYC Submit] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { selfieUrl, idUrl } = body;
    console.log("[KYC Submit] Received URLs:", { selfieUrl, idUrl });

    if (!selfieUrl || !idUrl) {
      console.error("[KYC Submit] Missing required fields:", { selfieUrl: !!selfieUrl, idUrl: !!idUrl });
      return NextResponse.json(
        { error: "Missing selfieUrl or idUrl" },
        { status: 400 }
      );
    }

    // Update user's KYC status and store image URLs
    console.log("[KYC Submit] Updating user in database...");
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          kycStatus: "SUBMITTED",
          kycSelfieUrl: selfieUrl,
          kycIdUrl: idUrl,
          kycSubmittedAt: new Date(),
        },
      });
      console.log("[KYC Submit] User updated successfully:", {
        userId: updatedUser.id,
        kycStatus: updatedUser.kycStatus,
        hasSelfieUrl: !!updatedUser.kycSelfieUrl,
        hasIdUrl: !!updatedUser.kycIdUrl,
        submittedAt: updatedUser.kycSubmittedAt,
      });
    } catch (prismaError) {
      console.error("[KYC Submit] Prisma update failed:", prismaError);
      // Re-throw to be caught by outer catch block
      throw prismaError;
    }

    const response = {
      success: true,
      user: {
        id: updatedUser.id,
        kycStatus: updatedUser.kycStatus,
        kycSelfieUrl: updatedUser.kycSelfieUrl,
        kycIdUrl: updatedUser.kycIdUrl,
        kycSubmittedAt: updatedUser.kycSubmittedAt,
      },
    };

    console.log("[KYC Submit] Submission completed successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[KYC Submit] Error occurred:", error);
    
    // Provide more detailed error in development
    const isDev = process.env.NODE_ENV === "development";
    const errorMessage = isDev && error instanceof Error
      ? `Failed to submit KYC documents: ${error.message}`
      : "Failed to submit KYC documents";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
