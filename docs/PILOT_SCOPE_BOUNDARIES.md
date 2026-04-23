# Pilot Scope Boundaries (Tel-Aviv Alpha)

## In Scope
- Lifecycle policy correctness for bookings after return.
- Dispute window policy enforcement (48h).
- Non-return operational escalation path for admin.
- User-facing dispute opening flow from booking screens.
- Lightweight lifecycle analytics events for pilot reporting.
- Admin auditability for lifecycle overrides/escalations.

## Out of Scope (Explicit)
- Stripe / SetupIntent / deposit authorization-capture implementation.
- Payment processor reconciliation and payout rail automation.
- Phone + SMS OTP authentication migration.

## Module Alignment
- Lifecycle and policy routes:
  - `app/api/bookings/[id]/return-checklist/route.ts`
  - `app/api/bookings/[id]/dispute/route.ts`
  - `app/api/admin/bookings/[id]/route.ts`
- User flow surfaces:
  - `app/(main)/bookings/[id]/page.tsx`
  - `app/(main)/bookings/[id]/dispute/page.tsx`
- Admin operations:
  - `app/(main)/admin/bookings/[id]/page.tsx`
  - `app/(main)/admin/bookings/[id]/admin-booking-ops-form.tsx`
- Event baseline:
  - `lib/analytics.ts`
  - `prisma/schema.prisma` (`AnalyticsEvent`)

