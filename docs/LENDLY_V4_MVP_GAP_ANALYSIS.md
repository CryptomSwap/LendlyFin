# Lendly v4 MVP Gap Analysis

This report compares the v4 pilot-safe spec against what currently exists in this repository.

## Legend
- **Implemented**: End-to-end exists (model + API + UI/surface).
- **Partial**: Exists but does not match strict v4 behavior/policy.
- **Missing**: Not implemented or not evidenced in code.

## 1) Spec-to-System Matrix

| Spec Area | Status | Evidence | Gap |
|---|---|---|---|
| Full rental lifecycle support | Partial | `app/api/bookings/create/route.ts`, `app/api/bookings/[id]/pickup-checklist/route.ts`, `app/api/bookings/[id]/return-checklist/route.ts`, `app/api/bookings/[id]/dispute/route.ts` | Missing strict v4 states/timers/non-return branch |
| Authorization-based deposit protection | Partial | `lib/payments/adapter.ts`, `prisma/schema.prisma` (`DepositStatus`) | Manual held/release model, not explicit authorize/reauthorize/capture workflow |
| Bottom navigation structure | Partial | `components/bottom-nav.tsx` | Has `Search/Bookings/Help/Profile`; missing `Home` and `Add Listing` as tabs |
| Stack screens (checkout/status/chat/pickup/return/dispute/map) | Partial | `app/(main)/checkout/page.tsx`, `app/(main)/bookings/[id]/page.tsx`, pickup/return/messages pages | No dedicated user dispute-open screen and no dedicated map-view route screen |
| Mobile-first + Hebrew RTL | Implemented | `app/layout.tsx` (`lang="he"`, `dir="rtl"`), `components/bottom-nav.tsx` | Baseline is strong |
| Roles (renter/lender/admin) | Implemented | `lib/booking-auth.ts`, `lib/admin.ts`, `app/api/admin/*` | Admin granularity is only boolean (`isAdmin`) |
| Phone + SMS OTP auth | Missing | Auth configured in `app/api/auth/[...nextauth]/route.ts`, `lib/auth/nextauth-options.ts` | Currently Google auth, no OTP path |
| KYC required for booking | Implemented | KYC gate in `app/api/bookings/create/route.ts`, KYC fields in `prisma/schema.prisma` | Manual admin review flow |
| Delete uploaded ID images post-verification | Missing | KYC upload endpoints and URL fields in `app/api/kyc/upload/route.ts`, `prisma/schema.prisma` | No auto-delete policy/job evidenced |
| Listing wizard fields | Partial | `app/(main)/add/page.tsx` | Availability is managed after creation; no hard 1-10 photo enforcement |
| Listing page details + CTA | Partial | `app/(main)/listing/[id]/page.tsx` | Some UI details differ from spec (pickup iconography/minimap expectations) |
| Search + map + filters | Partial | `app/(main)/search/search-client.tsx`, `components/listings-map.tsx` | Date availability filter and listing mini-map parity missing |
| Booking status list from spec | Missing | `BookingStatus` enum in `prisma/schema.prisma` | Only `REQUESTED/CONFIRMED/ACTIVE/COMPLETED/DISPUTE` currently |
| Capture rent on acceptance; authorize deposit only | Partial | `lib/payments/adapter.ts`, admin confirm route | Manual Bit + mock intent; no provider-level auth/capture semantics |
| Reauthorize deposit at pickup (SetupIntent) | Missing | Pickup flow in `app/api/bookings/[id]/pickup-checklist/route.ts` | No SetupIntent/reauthorization code |
| Return -> returned + 48h dispute window | Missing | Return flow in `app/api/bookings/[id]/return-checklist/route.ts` | Jumps to completed/dispute; no timed window |
| Auto-complete and payout after no dispute | Missing | No scheduler/payout worker found | No delayed window automation |
| Dispute flow with capture/partial/release | Partial | `app/api/admin/disputes/[id]/resolve/route.ts` | Supports owner/renter/split, but not explicit PSP capture/release operations |
| Non-return flow (`non_return_pending`, `non_return_confirmed`) | Missing | No related statuses/routes in schema or APIs | Entire branch absent |
| Deposit state machine from v4 | Missing | `DepositStatus` enum in `prisma/schema.prisma` | Current enum does not include `authorized/reauthorized/capturable/captured/released/refunded` |
| Pickup checklist required media/metadata | Partial | Photo angle enforcement in `lib/booking-auth.ts`, pickup API route | No persisted geo/timestamp metadata fields evidenced |
| Return checklist and issue auto-dispute | Partial | `app/api/bookings/[id]/return-checklist/route.ts` | Missing timed dispute window/status progression |
| Dispute statuses from v4 | Partial | `DisputeStatus` enum in `prisma/schema.prisma` | Missing `needs_info` and some exact status names |
| Payout delay logic | Missing | `lib/pricing.ts`, `lib/owner/dashboard.ts` | No payout ledger, transfer pipeline, or delay orchestration |
| Admin panel capabilities | Partial | `app/(main)/admin/*`, `app/api/admin/*` | Gaps in manual status override breadth + explicit deposit capture/release/refund ops |
| Analytics events required by spec | Missing | Aggregate metrics only in `app/api/admin/metrics/route.ts` | No lifecycle analytics event pipeline/instrumentation |
| Required data models list | Partial | `prisma/schema.prisma` has `User/Listing/Booking/Conversation/Message/Checklist/Dispute/Review` | Missing dedicated `Payment`, `Deposit`, `BookingRiskAssessment`, `CourierJob`, `AnalyticsEvent` models |
| Definition of Done (section 18) | Partial | KYC gate/listings/bookings/checklists/disputes/admin exist | Core misses: deposit auth/capture semantics, non-return flow, payout delay, analytics events |

## 2) What Is Already Strong
- End-to-end booking path with operational admin controls.
- Listing creation, search, map/list views, and booking checkout UX.
- Required pickup/return checklist mechanics with photo-angle validation.
- KYC gating and admin KYC handling.
- Messaging and post-booking review features.
- Hebrew RTL and mobile-first foundation.

## 3) Pilot-Critical Missing Pieces
1. Payment/deposit semantics still mock/manual and not v4-compliant statefully.
2. Booking and deposit state machines do not match required v4 statuses.
3. No enforced 48h post-return dispute window.
4. No non-return policy branch/status flow.
5. No delayed payout orchestration after dispute window.
6. No required analytics event stream (`signup_*`, `booking_*`, `deposit_*`, etc.).
7. No OTP auth path (spec parity gap).

## 4) Priority Blockers (By Launch Criticality)

### P0 (must-have)
1. Expand booking/deposit state models to v4.
2. Enforce dispute window timing after return.
3. Implement non-return branch and admin resolution path.
4. Implement deposit capture/release primitives consistent with provider semantics.
5. Implement payout delay orchestration.

### P1 (should-have for confidence)
1. User-facing dispute-open flow in booking UX.
2. Instrument required analytics events.
3. Align bottom nav to v4 core tabs.

### P2 (follow-up)
1. Add phone/SMS OTP auth option.
2. Add KYC media retention/deletion automation.
3. Expand search parity (date availability filter/minimap behavior).

## 5) Minimal Phased Backlog

### Phase 1: Lifecycle and Policy Correctness
- Update `BookingStatus` and `DepositStatus` to v4-aligned states in `prisma/schema.prisma`.
- Add transition guards in booking/dispute APIs for new statuses.
- Persist lifecycle timestamps required for policy windows (e.g., return/dispute deadlines).

### Phase 2: Payment/Deposit Integrity
- Refactor `lib/payments/adapter.ts` to explicit authorize/capture/release operations.
- Add provider metadata fields (authorization IDs, capture deadlines, captured/released timestamps).
- Add admin API actions for capture, partial capture, and release with auditable outcomes.

### Phase 3: Return/Dispute/Non-return Flows
- Add `returned` state and 48h dispute window enforcement.
- Add non-return detection and escalation (`non_return_pending` -> `non_return_confirmed`).
- Add renter/lender dispute-open UI surface from booking status page.

### Phase 4: Payout + Analytics + UX Parity
- Add payout scheduling and settlement tracking after dispute window completion.
- Implement event tracking for required lifecycle/admin analytics events.
- Align bottom nav to v4 and close UI parity gaps (map/listing mini-map where applicable).

## 6) Definition-of-Done Snapshot Against v4 Section 18
- KYC required for booking: **Yes**
- Listings bookable: **Yes**
- Rental captured: **Partial (manual flow)**
- Deposit authorized: **Partial (simulated held state)**
- Pickup checklist gates activation: **Yes**
- Return checklist gates completion: **Yes**
- Disputes capturable via admin: **Partial**
- Deposit capturable manually: **Partial**
- Non-return flow enforced: **No**
- Payout delayed until dispute window ends: **No**
- Analytics events firing: **No**

