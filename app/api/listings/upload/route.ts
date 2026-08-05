import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  buildListingS3ObjectKey,
  buildListingS3StoredRef,
} from "@/lib/listing-images";
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
      keyPrefix: "listings:upload",
      windowMs: 60_000,
      limit: 30,
      identifier: user.id,
    });
    if (!uploadRate.ok) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(uploadRate.retryAfterSec) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
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
        const base64 = buffer.toString("base64");
        storedRef = `data:${mime || "image/jpeg"};base64,${base64}`;
      } else {
        try {
          const objectId = randomUUID();
          const key = buildListingS3ObjectKey(objectId, safeExt);
          await putKycS3Object(key, new Uint8Array(buffer), mime || "image/jpeg");
          storedRef = buildListingS3StoredRef(key);
        } catch (s3Err) {
          console.error("S3 upload failed, falling back to base64:", s3Err);
          const base64 = buffer.toString("base64");
          storedRef = `data:${mime || "image/jpeg"};base64,${base64}`;
        }
      }
    } else {
      const uploadsDir = join(process.cwd(), "public", "uploads", "listings");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      const filename = `${randomUUID()}.${safeExt}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      storedRef = `/uploads/listings/${filename}`;
    }

    return NextResponse.json({ url: storedRef });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Listing upload error:", msg, error);
    return NextResponse.json(
      { error: `שגיאה בהעלאת הקובץ: ${msg.slice(0, 200)}` },
      { status: 500 }
    );
  }
}
