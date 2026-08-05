import { NextResponse } from "next/server";
import { getKycS3ObjectBytes } from "@/lib/kyc-s3";
import { parseListingStoredRef, buildListingS3StoredRef } from "@/lib/listing-images";

export const runtime = "nodejs";

/**
 * Public read proxy for listing photos stored in the private KYC/listings S3 bucket.
 * Path: /api/listings/images/listings/{id}.jpg
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await ctx.params;
  const s3Key = segments.map((s) => decodeURIComponent(s)).join("/");
  const stored = buildListingS3StoredRef(s3Key);
  if (parseListingStoredRef(stored)?.kind !== "s3") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await getKycS3ObjectBytes(s3Key);
    return new Response(Buffer.from(file.bytes), {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
