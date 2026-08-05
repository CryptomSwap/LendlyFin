import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { extname } from "path";

let cachedClient: S3Client | null = null;

export function getKycS3Bucket(): string {
  const b = process.env.KYC_S3_BUCKET?.trim();
  if (!b) {
    throw new Error("KYC_S3_BUCKET is not configured");
  }
  return b;
}

/** Call before production KYC S3 operations; returns an error message or null if OK. */
export function getKycS3ConfigError(): string | null {
  if (!process.env.KYC_S3_BUCKET?.trim()) {
    return "KYC_S3_BUCKET is not configured";
  }
  if (
    !process.env.AWS_REGION?.trim() &&
    !process.env.KYC_S3_REGION?.trim()
  ) {
    return "AWS_REGION or KYC_S3_REGION must be set for KYC S3 access";
  }
  return null;
}

function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const region =
    process.env.AWS_REGION?.trim() ||
    process.env.KYC_S3_REGION?.trim() ||
    "us-east-1";
  const endpoint = process.env.KYC_S3_ENDPOINT?.trim() || undefined;
  const forcePathStyle = process.env.KYC_S3_FORCE_PATH_STYLE === "true";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  cachedClient = new S3Client({
    region,
    endpoint,
    forcePathStyle,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
  return cachedClient;
}

function contentTypeFromKey(key: string): string {
  const ext = extname(key).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function putKycS3Object(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getKycS3Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    })
  );
}

export async function getKycS3ObjectBytes(key: string): Promise<{
  bytes: Uint8Array;
  contentType: string;
}> {
  const res = await getS3Client().send(
    new GetObjectCommand({
      Bucket: getKycS3Bucket(),
      Key: key,
    })
  );
  if (!res.Body) {
    throw new Error("Empty S3 object body");
  }
  const bytes = new Uint8Array(await res.Body.transformToByteArray());
  const ct = res.ContentType?.startsWith("image/")
    ? res.ContentType
    : contentTypeFromKey(key);
  return { bytes, contentType: ct };
}

export async function deleteKycS3Object(key: string): Promise<void> {
  try {
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: getKycS3Bucket(),
        Key: key,
      })
    );
  } catch {
    // best-effort cleanup
  }
}
