// Development: stores under public/uploads/kyc/{userId}/{type}.{ext}
// Production: private S3 bucket (see KYC_S3_* env vars in .env.example).
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getCurrentUser } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { AUDIT_ENTITY } from "@/lib/audit";
import { forwardErrorIfConfigured, logApiError, logEvent } from "@/lib/observability";
import {
  buildKycS3ObjectKey,
  buildKycS3StoredRef,
} from "@/lib/kyc-stored-ref";
import { getKycS3ConfigError, putKycS3Object } from "@/lib/kyc-s3";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const uploadRate = await checkRateLimit(req, {
      keyPrefix: "kyc:upload",
      windowMs: 60_000,
      limit: 12,
      identifier: user.id,
      auditEntityType: AUDIT_ENTITY.KYC,
      auditEntityId: user.id,
      auditTargetDisplayName: "kyc:upload",
    });
    if (!uploadRate.ok) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(uploadRate.retryAfterSec) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file or type parameter" },
        { status: 400 }
      );
    }

    if (type !== "selfie" && type !== "id") {
      return NextResponse.json(
        { error: "Type must be 'selfie' or 'id'" },
        { status: 400 }
      );
    }

    const mime = (file.type || "").toLowerCase();
    if (!mime.startsWith("image/") || !ALLOWED_IMAGE_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "File must be a JPEG, PNG, WebP, or GIF image" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const extension = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt =
      extension === "jpeg" || extension === "jpg"
        ? "jpg"
        : extension === "png"
          ? "png"
          : extension === "webp"
            ? "webp"
            : extension === "gif"
              ? "gif"
              : "jpg";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isProduction = process.env.NODE_ENV === "production";

    let storedRef: string;

    if (isProduction) {
      const configErr = getKycS3ConfigError();
      if (configErr) {
        return NextResponse.json({ error: configErr }, { status: 503 });
      }
      const key = buildKycS3ObjectKey(user.id, type, safeExt);
      await putKycS3Object(
        key,
        new Uint8Array(buffer),
        mime || "image/jpeg"
      );
      storedRef = buildKycS3StoredRef(key);
    } else {
      const uploadsDir = join(process.cwd(), "public", "uploads", "kyc", user.id);
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      const filename = `${type}.${safeExt}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      storedRef = `/uploads/kyc/${user.id}/${filename}`;
    }

    logEvent({
      event: "kyc.upload.success",
      route: "/api/kyc/upload",
      actorId: user.id,
      context: { type, size: file.size, storage: isProduction ? "s3" : "local" },
      tags: ["kyc", "upload"],
    });
    return NextResponse.json({ url: storedRef });
  } catch (error) {
    logApiError({
      event: "kyc.upload.failed",
      route: "/api/kyc/upload",
      error,
    });
    await forwardErrorIfConfigured({
      event: "kyc.upload.failed",
      route: "/api/kyc/upload",
      error,
    });
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
