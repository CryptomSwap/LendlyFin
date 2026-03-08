/**
 * Minimal auth user shape used by routes and guards.
 * Adapters (dev, future session/OTP) map their source to this type.
 * email, phoneNumber, city used for onboarding checks.
 */
export type AuthUser = {
  id: string;
  name: string | null;
  isAdmin: boolean;
  kycStatus?: string | null;
  kycRejectedReason?: string | null;
  suspendedAt?: Date | null;
  /** Set by session adapter for onboarding guard */
  email?: string | null;
  phoneNumber?: string | null;
  city?: string | null;
};
