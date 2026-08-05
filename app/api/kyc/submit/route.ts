import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { trackEvent } from "@/lib/analytics";
import { recordSystemAlert } from "@/lib/observability";
import {
  kycRefBelongsToUser,
  kycUrlsForApiResponse,
  parseKycStoredRef,
} from "@/lib/kyc-stored-ref";

export const runtime = "nodejs";

function validateSubmitRefs(
  selfieUrl: string,
  idUrl: string,
  userId: string,
  isProduction: boolean
): string | null {
  if (
    !kycRefBelongsToUser(selfieUrl, userId, "selfie") ||
    !kycRefBelongsToUser(idUrl, userId, "id")
  ) {
    return "Invalid KYC document references";
  }
  const selfieParsed = parseKycStoredRef(selfieUrl);
  const idParsed = parseKycStoredRef(idUrl);
  if (!selfieParsed || !idParsed) {
    return "Invalid KYC document references";
  }
  if (isProduction) {
    if (selfieParsed.kind !== "s3" || idParsed.kind !== "s3") {
      return "Invalid KYC document references for production";
    }
  } else if (selfieParsed.kind !== "local" || idParsed.kind !== "local") {
    return "Invalid KYC document references";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.kycStatus === "SUBMITTED" || user.kycStatus === "APPROVED") {
      return NextResponse.json(
        {
          error: `Cannot submit KYC: already ${
            user.kycStatus === "SUBMITTED" ? "submitted" : "approved"
          }`,
        },
        { status: 400 }
      );
    }

    let body: { selfieUrl?: string; idUrl?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { selfieUrl, idUrl } = body;
    if (
      typeof selfieUrl !== "string" ||
      typeof idUrl !== "string" ||
      !selfieUrl ||
      !idUrl
    ) {
      return NextResponse.json(
        { error: "Missing selfieUrl or idUrl" },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const refError = validateSubmitRefs(selfieUrl, idUrl, user.id, isProduction);
    if (refError) {
      return NextResponse.json({ error: refError }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        kycStatus: "SUBMITTED",
        kycSelfieUrl: selfieUrl,
        kycIdUrl: idUrl,
        kycSubmittedAt: new Date(),
        kycRejectedReason: null,
      },
    });

    const publicUrls = kycUrlsForApiResponse(
      updatedUser.id,
      updatedUser.kycSelfieUrl,
      updatedUser.kycIdUrl
    );

    await trackEvent({
      eventName: "kyc_submitted",
      userId: user.id,
      payload: { hasSelfieUrl: Boolean(selfieUrl), hasIdUrl: Boolean(idUrl) },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        kycStatus: updatedUser.kycStatus,
        kycSelfieUrl: publicUrls.kycSelfieUrl,
        kycIdUrl: publicUrls.kycIdUrl,
        kycSubmittedAt: updatedUser.kycSubmittedAt,
      },
    });
  } catch (error) {
    console.error("[KYC Submit] Error:", error);
    await recordSystemAlert({
      level: "error",
      source: "kyc.submit",
      message: "KYC submission failed",
      context: { error: error instanceof Error ? error.message : String(error) },
    });

    const isDev = process.env.NODE_ENV === "development";
    const errorMessage =
      isDev && error instanceof Error
        ? `Failed to submit KYC documents: ${error.message}`
        : "Failed to submit KYC documents";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
