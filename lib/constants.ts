/**
 * Category tree — single source of truth for listing creation, search filters, and display.
 * Ported from Repo A (Lendly MVP) with Hebrew labels; Repo B uses slug as stored value.
 */

export const CATEGORY_LIST = [
  { slug: "camera", labelHe: "צילום ווידאו" },
  { slug: "tools", labelHe: "כלי עבודה" },
  { slug: "dj", labelHe: "ציוד DJ" },
  { slug: "camping", labelHe: "קמפינג וטיולים" },
  { slug: "sports", labelHe: "ציוד ספורט" },
  { slug: "music", labelHe: "ציוד מוזיקה" },
] as const;

export type CategorySlug = (typeof CATEGORY_LIST)[number]["slug"];

/** Map slug → Hebrew label for display and validation */
export const CATEGORIES: Record<string, string> = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.slug, c.labelHe])
);

/** All valid category slugs (for validation / API) */
export const CATEGORY_SLUGS = CATEGORY_LIST.map((c) => c.slug);

/**
 * Get Hebrew label for a category slug. Returns the slug if unknown (e.g. legacy data).
 */
export function getCategoryLabel(slug: string): string {
  return CATEGORIES[slug.toLowerCase()] ?? slug;
}

/**
 * Check if a string is a valid category slug.
 */
export function isValidCategorySlug(slug: string): boolean {
  return CATEGORY_SLUGS.includes(slug.toLowerCase() as CategorySlug);
}

// ---------------------------------------------------------------------------
// Cities in Israel (for location selection in listing creation / search)
// ---------------------------------------------------------------------------

export const CITIES = [
  "תל אביב-יפו",
  "ירושלים",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "באר שבע",
  "חולון",
  "רמת גן",
  "אשקלון",
  "רחובות",
  "הרצליה",
  "כפר סבא",
  "בת ים",
  "רמלה",
  "לוד",
  "נהריה",
  "אילת",
  "טבריה",
] as const;

export type City = (typeof CITIES)[number];
