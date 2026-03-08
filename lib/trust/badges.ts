/**
 * Trust badges: deterministic, derived from existing data.
 * No complex score; thresholds in one place for easy tweaking.
 */

/** Minimum completed bookings (as owner) to show "experienced" badge */
export const TRUST_THRESHOLD_EXPERIENCED_BOOKINGS = 3;

/** Minimum number of reviews (received as owner) to consider "highly rated" */
export const TRUST_THRESHOLD_MIN_REVIEWS = 3;

/** Minimum average rating (1–5) to show "highly rated" badge */
export const TRUST_THRESHOLD_MIN_RATING = 4;

export type TrustBadgeKey = "identity" | "phone" | "experienced" | "highly_rated";

export interface TrustBadge {
  key: TrustBadgeKey;
  label: string;
  /** Short explainer for tooltip/aria */
  tooltip: string;
}

const BADGE_DEFINITIONS: Record<TrustBadgeKey, TrustBadge> = {
  identity: {
    key: "identity",
    label: "מאומת זהות",
    tooltip: "אימות זהות (KYC) אושר על ידי המערכת",
  },
  phone: {
    key: "phone",
    label: "טלפון מאומת",
    tooltip: "משתמש עם מספר טלפון רשום",
  },
  experienced: {
    key: "experienced",
    label: "מלווה מנוסה",
    tooltip: `לפחות ${TRUST_THRESHOLD_EXPERIENCED_BOOKINGS} השכרות שהושלמו בהצלחה`,
  },
  highly_rated: {
    key: "highly_rated",
    label: "דירוג גבוה",
    tooltip: `לפחות ${TRUST_THRESHOLD_MIN_REVIEWS} ביקורות עם דירוג ממוצע ${TRUST_THRESHOLD_MIN_RATING}+`,
  },
};

export interface OwnerTrustInput {
  kycStatus?: string | null;
  phoneNumber?: string | null;
}

export interface ListingTrustInput extends OwnerTrustInput {
  completedBookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
}

/**
 * Compute which trust badges to show for a listing (owner + listing stats).
 */
export function getListingTrustBadges(input: ListingTrustInput): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (input.kycStatus === "APPROVED") {
    badges.push(BADGE_DEFINITIONS.identity);
  }

  if (input.phoneNumber != null && String(input.phoneNumber).trim() !== "") {
    badges.push(BADGE_DEFINITIONS.phone);
  }

  const completed = input.completedBookingsCount ?? 0;
  if (completed >= TRUST_THRESHOLD_EXPERIENCED_BOOKINGS) {
    badges.push(BADGE_DEFINITIONS.experienced);
  }

  const count = input.reviewsCount ?? 0;
  const avg = input.averageRating ?? 0;
  if (
    count >= TRUST_THRESHOLD_MIN_REVIEWS &&
    avg >= TRUST_THRESHOLD_MIN_RATING
  ) {
    badges.push(BADGE_DEFINITIONS.highly_rated);
  }

  return badges;
}

/**
 * Compute trust badges for a user profile (no listing-specific stats required).
 * Use when you have owner-only data (e.g. profile page with optional stats).
 */
export function getUserTrustBadges(
  input: OwnerTrustInput & {
    completedBookingsCount?: number;
    reviewsCount?: number;
    averageRating?: number;
  }
): TrustBadge[] {
  return getListingTrustBadges(input);
}

export function getBadgeDefinition(key: TrustBadgeKey): TrustBadge {
  return BADGE_DEFINITIONS[key];
}
