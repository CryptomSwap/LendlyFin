/**
 * Dev-only impersonation: allowed user ids for the switcher.
 * Only these ids can be set via the dev_impersonate_id cookie.
 */

export const DEV_IMPERSONATION_ALLOWED_IDS = [
  "admin-user",
  "dev-user",
  "qa-renter",
  "qa-renter-no-bookings",
  "qa-owner-approved",
  "qa-owner-pending-kyc",
  "qa-onboarding-incomplete",
  "qa-kyc-submitted",
  "qa-kyc-rejected",
] as const;

export type DevImpersonationId = (typeof DEV_IMPERSONATION_ALLOWED_IDS)[number];

export const DEV_IMPERSONATION_LABELS: Record<string, string> = {
  "admin-user": "Admin",
  "dev-user": "Lender (legacy)",
  "qa-renter": "Renter (multi-booking)",
  "qa-renter-no-bookings": "Renter (no bookings)",
  "qa-owner-approved": "Owner (approved, active listings)",
  "qa-owner-pending-kyc": "Owner (KYC pending)",
  "qa-onboarding-incomplete": "Onboarding incomplete",
  "qa-kyc-submitted": "KYC Submitted",
  "qa-kyc-rejected": "KYC Rejected",
};

export const DEV_IMPERSONATE_COOKIE_NAME = "dev_impersonate_id";

export function isAllowedDevImpersonationId(id: string): id is DevImpersonationId {
  return (DEV_IMPERSONATION_ALLOWED_IDS as readonly string[]).includes(id);
}
