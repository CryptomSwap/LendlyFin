import { join, normalize, extname } from "path";
import { readFile } from "fs/promises";
import { parseKycStoredRef } from "@/lib/kyc-stored-ref";
import { getKycS3ObjectBytes } from "@/lib/kyc-s3";

const SAFE_UPLOAD_PREFIX = "/uploads/kyc/";

export { buildKycFileProxyUrl } from "@/lib/kyc-stored-ref";

export async function readKycImageFromStoredUrl(storedUrl: string): Promise<{
  bytes: Uint8Array;
  contentType: string;
}> {
  const parsed = parseKycStoredRef(storedUrl);
  if (!parsed) {
    throw new Error("Invalid KYC file path");
  }

  if (parsed.kind === "s3") {
    return getKycS3ObjectBytes(parsed.key);
  }

  if (!parsed.storedUrl.startsWith(SAFE_UPLOAD_PREFIX)) {
    throw new Error("Invalid KYC file path");
  }

  const relPath = parsed.storedUrl.replace(/^\//, "");
  const filePath = normalize(join(process.cwd(), "public", relPath));
  const allowedRoot = normalize(join(process.cwd(), "public", "uploads", "kyc"));
  if (!filePath.startsWith(allowedRoot)) {
    throw new Error("Invalid KYC file path");
  }

  const bytes = await readFile(filePath);
  const ext = extname(filePath).toLowerCase();
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
          ? "image/gif"
          : "image/jpeg";

  return { bytes, contentType };
}
