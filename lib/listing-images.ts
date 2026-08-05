/**
 * Listing image stored references and public URL resolution.
 * DB stores short refs (local path, listing-s3:key, or https URL) — never new base64 in production.
 */

export const LISTING_S3_REF_PREFIX = "listing-s3:" as const;
const LOCAL_LISTING_PREFIX = "/uploads/listings/";
const S3_KEY_RE = /^listings\/[a-z0-9-]+\.(jpe?g|png|webp|gif)$/i;

export type ParsedListingImageRef =
  | { kind: "s3"; key: string }
  | { kind: "local"; path: string }
  | { kind: "https"; url: string }
  | { kind: "inline"; dataUrl: string };

export function parseListingStoredRef(stored: string): ParsedListingImageRef | null {
  if (stored.startsWith(LISTING_S3_REF_PREFIX)) {
    const key = stored.slice(LISTING_S3_REF_PREFIX.length);
    if (!S3_KEY_RE.test(key)) return null;
    return { kind: "s3", key };
  }
  if (stored.startsWith(LOCAL_LISTING_PREFIX)) {
    return { kind: "local", path: stored };
  }
  if (stored.startsWith("https://") || stored.startsWith("http://")) {
    return { kind: "https", url: stored };
  }
  if (stored.startsWith("data:image/")) {
    return { kind: "inline", dataUrl: stored };
  }
  return null;
}

export function buildListingS3StoredRef(key: string): string {
  return `${LISTING_S3_REF_PREFIX}${key}`;
}

export function buildListingS3ObjectKey(id: string, extension: string): string {
  const ext = extension.replace(/^\./, "").toLowerCase();
  const safe =
    ext === "jpeg" || ext === "jpg"
      ? "jpg"
      : ext === "png"
        ? "png"
        : ext === "webp"
          ? "webp"
          : ext === "gif"
            ? "gif"
            : "jpg";
  return `listings/${id}.${safe}`;
}

export function isInlineListingImage(stored: string): boolean {
  return stored.startsWith("data:image/");
}

/** Whether this URL may be written to ListingImage.url */
export function isAllowedListingImageStoredUrl(
  url: string,
  isProduction: boolean
): boolean {
  if (url.startsWith("data:image/")) return !isProduction;
  if (url.startsWith(LISTING_S3_REF_PREFIX)) return parseListingStoredRef(url) !== null;
  if (url.startsWith(LOCAL_LISTING_PREFIX)) return !isProduction;
  if (url.startsWith("https://") || url.startsWith("http://")) return true;
  return false;
}

export function buildListingImageProxyPath(s3Key: string): string {
  const segments = s3Key.split("/").map((s) => encodeURIComponent(s));
  return `/api/listings/images/${segments.join("/")}`;
}

/** Client-safe URL for <img src> — never returns huge inline blobs for list UIs. */
export function resolveListingImagePublicUrl(
  stored: string,
  options?: { allowInline?: boolean }
): string | null {
  const parsed = parseListingStoredRef(stored);
  if (!parsed) return null;
  switch (parsed.kind) {
    case "s3":
      return buildListingImageProxyPath(parsed.key);
    case "local":
      return parsed.path;
    case "https":
      return parsed.url;
    case "inline":
      return options?.allowInline ? parsed.dataUrl : null;
    default:
      return null;
  }
}

export function sanitizeListingImageUrls(
  raw: string[],
  isProduction: boolean
): string[] {
  const maxImages = 10;
  return raw
    .filter((url) => isAllowedListingImageStoredUrl(url, isProduction))
    .slice(0, maxImages);
}

export function pickListingCoverStoredUrl(
  images: Array<{ url: string; order: number }>
): string | null {
  if (images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const preferred = sorted.find((im) => !isInlineListingImage(im.url));
  return (preferred ?? sorted[0])?.url ?? null;
}

export function mapListingImagesForApi(
  images: Array<{ url: string; order: number }>,
  options?: { allowInline?: boolean }
): Array<{ url: string; order: number }> {
  return images
    .map((im) => ({
      order: im.order,
      url: resolveListingImagePublicUrl(im.url, options) ?? "",
    }))
    .filter((im) => im.url.length > 0);
}

export function listingCoverImageUrl(
  images: Array<{ url: string; order: number }>,
  options?: { allowInline?: boolean }
): string | null {
  const stored = pickListingCoverStoredUrl(images);
  if (!stored) return null;
  return resolveListingImagePublicUrl(stored, { allowInline: true, ...options });
}
