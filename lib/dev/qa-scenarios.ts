/**
 * QA scenario map: stable ids and labels for seeded data.
 * Use these in /dev/qa and tests instead of hardcoding ids.
 * User labels for impersonation: see DEV_IMPERSONATION_LABELS in lib/auth/dev-impersonation.
 */

export const QA_USER_IDS = {
  ADMIN: "admin-user",
  DEV_LENDER: "dev-user",
  RENTER_MULTI_BOOKING: "qa-renter",
  RENTER_NO_BOOKINGS: "qa-renter-no-bookings",
  OWNER_APPROVED: "qa-owner-approved",
  OWNER_PENDING_KYC: "qa-owner-pending-kyc",
  ONBOARDING_INCOMPLETE: "qa-onboarding-incomplete",
  KYC_SUBMITTED: "qa-kyc-submitted",
  KYC_REJECTED: "qa-kyc-rejected",
} as const;

export const QA_LISTING_IDS = {
  SONY_CAMERA: "listing-sony",
  TENT: "listing-tent",
  DRILL: "listing-drill",
  BIKE: "listing-bike",
  LAPTOP: "listing-laptop",
  KAYAK: "listing-kayak",
  TABLE_PENDING: "listing-table-pending",
  CHAIR_REJECTED: "listing-chair-rejected",
  PAUSED_SLEEPING_BAG: "listing-paused",
} as const;

export const QA_BOOKING_IDS = {
  REQUESTED: "booking-requested",
  CONFIRMED: "booking-confirmed",
  ACTIVE: "booking-active",
  COMPLETED: "booking-completed",
  DISPUTE: "booking-dispute",
} as const;

export const QA_DISPUTE_IDS = {
  OPEN: "dispute-open",
} as const;

/** Short labels for seeded listings (for /dev/qa). */
export const QA_LISTING_LABELS: Record<(typeof QA_LISTING_IDS)[keyof typeof QA_LISTING_IDS], string> = {
  [QA_LISTING_IDS.SONY_CAMERA]: "Sony camera (ACTIVE)",
  [QA_LISTING_IDS.TENT]: "Tent (ACTIVE)",
  [QA_LISTING_IDS.DRILL]: "Drill (ACTIVE)",
  [QA_LISTING_IDS.BIKE]: "Bike (ACTIVE)",
  [QA_LISTING_IDS.LAPTOP]: "Laptop (ACTIVE)",
  [QA_LISTING_IDS.KAYAK]: "Kayak (ACTIVE)",
  [QA_LISTING_IDS.TABLE_PENDING]: "Table (PENDING_APPROVAL)",
  [QA_LISTING_IDS.CHAIR_REJECTED]: "Chair (REJECTED)",
  [QA_LISTING_IDS.PAUSED_SLEEPING_BAG]: "Sleeping bag (PAUSED)",
};

/** Short labels for seeded bookings (for /dev/qa). */
export const QA_BOOKING_LABELS: Record<(typeof QA_BOOKING_IDS)[keyof typeof QA_BOOKING_IDS], string> = {
  [QA_BOOKING_IDS.REQUESTED]: "REQUESTED (admin confirm payment)",
  [QA_BOOKING_IDS.CONFIRMED]: "CONFIRMED (pickup checklist)",
  [QA_BOOKING_IDS.ACTIVE]: "ACTIVE (return checklist)",
  [QA_BOOKING_IDS.COMPLETED]: "COMPLETED (reviews)",
  [QA_BOOKING_IDS.DISPUTE]: "DISPUTE (admin resolve)",
};

export const QA_SCENARIOS = {
  users: QA_USER_IDS,
  listings: QA_LISTING_IDS,
  bookings: QA_BOOKING_IDS,
  disputes: QA_DISPUTE_IDS,
} as const;
