import type { AuthUser } from "./types";

/**
 * Pilot onboarding: user must have full name, phone number, and city.
 * Onboarding complete only when all three are non-empty (after trim).
 */
export function needsOnboarding(user: AuthUser | null): boolean {
  if (!user) return false;
  const hasName = typeof user.name === "string" && user.name.trim().length > 0;
  const hasPhone = typeof user.phoneNumber === "string" && user.phoneNumber.trim().length > 0;
  const hasCity = typeof user.city === "string" && user.city.trim().length > 0;
  return !hasName || !hasPhone || !hasCity;
}
