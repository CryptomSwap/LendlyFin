/**
 * Category tree — two-level taxonomy for listing creation, search filters, and display.
 * Category + optional subcategories; backward compatible with flat category slug storage.
 */

export type SubcategoryItem = {
  key: string;
  label: string;
  slug: string;
  parentKey: string;
};

export type CategoryItem = {
  key: string;
  label: string;
  slug: string;
  children?: SubcategoryItem[];
};

/** Full taxonomy: categories with optional subcategories */
export const CATEGORY_TAXONOMY: CategoryItem[] = [
  {
    key: "camera",
    label: "צילום ווידאו",
    slug: "camera",
    children: [
      { key: "camera_photo", label: "מצלמות צילום", slug: "photo", parentKey: "camera" },
      { key: "camera_video", label: "מצלמות וידאו", slug: "video", parentKey: "camera" },
      { key: "camera_lighting", label: "תאורה", slug: "lighting", parentKey: "camera" },
      { key: "camera_accessories", label: "אבזרים", slug: "accessories", parentKey: "camera" },
    ],
  },
  {
    key: "tools",
    label: "כלי עבודה",
    slug: "tools",
    children: [
      { key: "tools_hand", label: "כלי יד", slug: "hand", parentKey: "tools" },
      { key: "tools_power", label: "כלי חשמל", slug: "power", parentKey: "tools" },
      { key: "tools_garden", label: "גינון", slug: "garden", parentKey: "tools" },
      { key: "tools_other", label: "אחר", slug: "other", parentKey: "tools" },
    ],
  },
  {
    key: "dj",
    label: "ציוד DJ",
    slug: "dj",
    children: [
      { key: "dj_systems", label: "מערכות", slug: "systems", parentKey: "dj" },
      { key: "dj_consoles", label: "קונסולות", slug: "consoles", parentKey: "dj" },
      { key: "dj_lighting", label: "תאורה", slug: "lighting", parentKey: "dj" },
      { key: "dj_speakers", label: "רמקולים", slug: "speakers", parentKey: "dj" },
    ],
  },
  {
    key: "camping",
    label: "קמפינג וטיולים",
    slug: "camping",
    children: [
      { key: "camping_tents", label: "אוהלים", slug: "tents", parentKey: "camping" },
      { key: "camping_sleep", label: "שינה", slug: "sleep", parentKey: "camping" },
      { key: "camping_cooking", label: "בישול", slug: "cooking", parentKey: "camping" },
      { key: "camping_other", label: "אחר", slug: "other", parentKey: "camping" },
    ],
  },
  {
    key: "sports",
    label: "ציוד ספורט",
    slug: "sports",
    children: [
      { key: "sports_bikes", label: "אופניים", slug: "bikes", parentKey: "sports" },
      { key: "sports_beach", label: "חוף וים", slug: "beach", parentKey: "sports" },
      { key: "sports_winter", label: "חורף", slug: "winter", parentKey: "sports" },
      { key: "sports_fitness", label: "כושר", slug: "fitness", parentKey: "sports" },
    ],
  },
  {
    key: "music",
    label: "ציוד מוזיקה",
    slug: "music",
    children: [
      { key: "music_guitars", label: "גיטרות", slug: "guitars", parentKey: "music" },
      { key: "music_drums", label: "תופים", slug: "drums", parentKey: "music" },
      { key: "music_keys", label: "קלידים", slug: "keys", parentKey: "music" },
      { key: "music_amps", label: "הגברה", slug: "amps", parentKey: "music" },
    ],
  },
];

/** Flat list of top-level categories (backward compatible: slug + labelHe) */
export const CATEGORY_LIST = CATEGORY_TAXONOMY.map((c) => ({
  slug: c.slug,
  labelHe: c.label,
})) as readonly { slug: string; labelHe: string }[];

export type CategorySlug = (typeof CATEGORY_LIST)[number]["slug"];

/** Map category slug → Hebrew label */
export const CATEGORIES: Record<string, string> = Object.fromEntries(
  CATEGORY_TAXONOMY.map((c) => [c.slug, c.label])
);

/** All valid category slugs */
export const CATEGORY_SLUGS = CATEGORY_TAXONOMY.map((c) => c.slug);

/** Subcategory slug is stored as-is (e.g. "photo", "hand"). Full key for display: category + subcategory. */
export function getSubcategoriesForCategory(categorySlug: string): SubcategoryItem[] {
  const cat = CATEGORY_TAXONOMY.find((c) => c.slug === categorySlug.toLowerCase());
  return cat?.children ?? [];
}

/** All subcategory slugs for a category (for validation) */
export function getSubcategorySlugsForCategory(categorySlug: string): string[] {
  return getSubcategoriesForCategory(categorySlug).map((s) => s.slug);
}

/**
 * Get Hebrew label for a category slug.
 */
export function getCategoryLabel(slug: string): string {
  return CATEGORIES[slug.toLowerCase()] ?? slug;
}

/**
 * Get Hebrew label for a subcategory (requires parent category slug to resolve).
 */
export function getSubcategoryLabel(categorySlug: string, subcategorySlug: string): string {
  const subs = getSubcategoriesForCategory(categorySlug);
  const sub = subs.find((s) => s.slug === subcategorySlug.toLowerCase());
  return sub?.label ?? subcategorySlug;
}

/**
 * Display label for listing: "Category" or "Category · Subcategory".
 */
export function getCategoryDisplayLabel(categorySlug: string, subcategorySlug?: string | null): string {
  const catLabel = getCategoryLabel(categorySlug);
  if (!subcategorySlug?.trim()) return catLabel;
  const subLabel = getSubcategoryLabel(categorySlug, subcategorySlug);
  return `${catLabel} · ${subLabel}`;
}

export function isValidCategorySlug(slug: string): boolean {
  return CATEGORY_SLUGS.includes(slug.toLowerCase() as CategorySlug);
}

export function isValidSubcategorySlug(categorySlug: string, subcategorySlug: string): boolean {
  const slugs = getSubcategorySlugsForCategory(categorySlug);
  return slugs.includes(subcategorySlug.toLowerCase());
}

/** All subcategories flattened (for search filter options when category is unknown) */
export const ALL_SUBCATEGORIES = CATEGORY_TAXONOMY.flatMap((c) =>
  (c.children ?? []).map((s) => ({ ...s, categorySlug: c.slug }))
);

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
