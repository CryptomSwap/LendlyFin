export const KYC_S3_REF_PREFIX = "kyc-s3:" as const;

export function buildKycFileProxyUrl(
  userId: string,
  type: "selfie" | "id"
): string {
  return `/api/kyc/files/${encodeURIComponent(userId)}/${type}`;
}

const SAFE_UPLOAD_PREFIX = "/uploads/kyc/";

export type ParsedKycRef =
  | { kind: "local"; storedUrl: string }
  | { kind: "s3"; key: string };

const S3_KEY_RE = /^kyc\/[^/]+\/(selfie|id)\.[a-z0-9]+$/i;

export function parseKycStoredRef(stored: string): ParsedKycRef | null {
  if (stored.startsWith(KYC_S3_REF_PREFIX)) {
    const key = stored.slice(KYC_S3_REF_PREFIX.length);
    if (!S3_KEY_RE.test(key)) return null;
    return { kind: "s3", key };
  }
  if (stored.startsWith(SAFE_UPLOAD_PREFIX)) {
    return { kind: "local", storedUrl: stored };
  }
  return null;
}

export function buildKycS3StoredRef(key: string): string {
  return `${KYC_S3_REF_PREFIX}${key}`;
}

export function buildKycS3ObjectKey(
  userId: string,
  type: "selfie" | "id",
  extension: string
): string {
  const ext = extension.replace(/^\./, "").toLowerCase();
  return `kyc/${userId}/${type}.${ext}`;
}

export function kycRefBelongsToUser(
  stored: string,
  userId: string,
  type: "selfie" | "id"
): boolean {
  const parsed = parseKycStoredRef(stored);
  if (!parsed) return false;
  if (parsed.kind === "s3") {
    const prefix = `kyc/${userId}/${type}.`;
    return parsed.key.startsWith(prefix);
  }
  const needle = `${SAFE_UPLOAD_PREFIX}${userId}/${type}.`;
  return stored.startsWith(needle);
}

/** Never expose raw bucket keys or local paths to clients; keep seed https URLs as-is. */
export function kycUrlsForApiResponse(
  userId: string,
  selfie: string | null,
  id: string | null
): { kycSelfieUrl: string | null; kycIdUrl: string | null } {
  return {
    kycSelfieUrl: toPublicKycUrl(userId, selfie, "selfie"),
    kycIdUrl: toPublicKycUrl(userId, id, "id"),
  };
}

function toPublicKycUrl(
  userId: string,
  stored: string | null,
  type: "selfie" | "id"
): string | null {
  if (!stored) return null;
  if (parseKycStoredRef(stored)) {
    return buildKycFileProxyUrl(userId, type);
  }
  return stored;
}
