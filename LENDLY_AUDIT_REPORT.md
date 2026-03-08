# Lendly (Ledly Tom) — Structured Audit Report

**Product:** Peer-to-peer equipment rental marketplace  
**Repository:** Lendly Tom (ledly-tom)  
**Stack:** Next.js 16 App Router, TypeScript, Prisma, SQLite (dev), Tailwind 4, Hebrew RTL, NextAuth (Google)

---

## A. Concise Architecture Summary

- **Routing:** Root `/` redirects to `/home`. Main app lives under `(main)` route group; all authenticated/protected flows use the same layout (AppShell + BottomNav). Public: `/`, `/search`, `/help`, `/signin`, `/onboarding`, `/listing/*` (except `/listing/[id]/manage`). Protected: `/add`, `/bookings`, `/checkout`, `/profile`, `/owner`, `/listing/[id]/manage`; admin under `/admin/*`.
- **Auth:** NextAuth JWT with Google provider. Session carries `lendlyUserId` and `onboardingComplete` (derived from name, phone, city). Middleware enforces auth and onboarding on protected paths; `DEV_AUTH_BYPASS` skips checks. Auth adapter in `lib/auth/adapter.ts` switches between session and dev adapter.
- **Booking lifecycle (fixed):** REQUESTED → (Bit redirect → admin confirms) → CONFIRMED → pickup checklist → ACTIVE → return checklist → COMPLETED or DISPUTE → admin resolves → COMPLETED. Status and payment/deposit transitions are in API routes and `lib/payments/adapter.ts`; emails are triggered from `lib/notifications/booking-lifecycle.ts`.
- **Payments:** Manual Bit only. `createIntent` in `lib/payments/adapter.ts` sets amounts and `paymentLink` from `MANUAL_BIT_PAYMENT_URL`; user redirects to Bit; admin confirms via `POST /api/admin/bookings/[id]/confirm-payment`, which sets payment SUCCEEDED, deposit HELD, status CONFIRMED and sends confirmation emails.
- **Data:** Prisma + SQLite; single `schema.prisma` with User, Listing, Booking, Review, Conversation/Message, Dispute, PickupChecklist, ReturnChecklist, BookingChecklistPhoto, ListingBlockedRange, ListingImage, AuditLog. Booking ref format `LND-XXXXXX` from `lib/booking-ref.ts`.

---

## 1. PROJECT STRUCTURE

### Top-level folders

| Path | Purpose |
|------|--------|
| `app/` | Next.js App Router: routes, layouts, API routes |
| `components/` | Shared React components (app-shell, nav, cards, UI primitives, feature components) |
| `lib/` | Utilities, auth, payments, pricing, availability, email, notifications, audit, trust |
| `prisma/` | Schema, migrations, seed, dev.db |
| `public/` | Static assets and uploads (e.g. `uploads/kyc/`) |

### App routes

- **Root:** `app/page.tsx` → redirect to `/home`.
- **Layouts:** `app/layout.tsx` (Heebo font, RTL, SessionProvider); `app/(main)/layout.tsx` (AppShell).
- **Pages under `(main)`:**
  - `app/(main)/home/page.tsx` — Home/landing (search hero, categories, “קרוב אליך” placeholders).
  - `app/(main)/search/page.tsx` — Search wrapper; client in `search-client.tsx`.
  - `app/(main)/listing/[id]/page.tsx` — Listing detail (server); `manage/page.tsx` + `manage-client.tsx` for availability.
  - `app/(main)/add/page.tsx` — Add listing wizard (client, 5 steps).
  - `app/(main)/checkout/page.tsx` — Checkout/payment (client; expects `bookingId` in query).
  - `app/(main)/bookings/page.tsx` — User bookings list (server).
  - `app/(main)/bookings/[id]/page.tsx` — Booking detail (server); `pickup/page.tsx`, `return/page.tsx`, `messages/page.tsx`; forms: `pickup-form.tsx`, `return-form.tsx`, `leave-review-form.tsx`, `messages-view.tsx`.
  - `app/(main)/profile/page.tsx` — Profile + KYC entry; `profile/kyc/page.tsx` for KYC flow.
  - `app/(main)/owner/page.tsx` — Owner dashboard.
  - `app/(main)/onboarding/page.tsx` — Onboarding (name, phone, city); `onboarding-form.tsx`.
  - `app/(main)/signin/page.tsx` — Sign-in (Google).
  - `app/(main)/help/page.tsx` and `help/faq`, `help/getting-started`, `help/insurance-terms`, `help/safety` — Help content.
  - **Admin:** `app/(main)/admin/bookings/page.tsx`, `bookings/[id]/page.tsx`, `confirm-payment-form.tsx`; `admin/disputes/page.tsx`, `disputes/[id]/page.tsx`, `resolve-form.tsx`; `admin/users/page.tsx`, `users/[id]/page.tsx`, `users-table.tsx`, `suspend-actions.tsx`; `admin/listings/page.tsx`; `admin/kyc/page.tsx`; `admin/metrics/page.tsx`.

### API routes

- **Auth:** `app/api/auth/[...nextauth]/route.ts`.
- **Me:** `app/api/me/route.ts` — current user (used by layout/pages for session).
- **Profile:** `app/api/profile/onboarding/route.ts`.
- **Listings:** `app/api/listings/route.ts` (GET/POST), `app/api/listings/search/route.ts`, `app/api/listings/upload/route.ts`, `app/api/listings/[id]/route.ts` (GET/PATCH), `app/api/listings/[id]/availability/route.ts`, `app/api/listings/[id]/blocked-ranges/route.ts` (GET/POST), `app/api/listings/[id]/blocked-ranges/[rangeId]/route.ts` (DELETE), `app/api/listings/[id]/reviews/route.ts`.
- **Bookings:** `app/api/bookings/route.ts` (GET), `app/api/bookings/create/route.ts` (POST), `app/api/bookings/[id]/route.ts`, `app/api/bookings/[id]/pickup-checklist/route.ts` (GET/PUT), `app/api/bookings/[id]/return-checklist/route.ts` (GET/PUT), `app/api/bookings/[id]/checklist-photos/route.ts`, `app/api/bookings/[id]/messages/route.ts`, `app/api/bookings/[id]/reviews/route.ts`, `app/api/bookings/[id]/dispute/route.ts` (POST).
- **Checkout / payments:** `app/api/checkout/summary/route.ts` (POST), `app/api/payments/create-intent/route.ts` (POST), `app/api/payments/confirm/route.ts` (POST; returns 403 when manual Bit — confirm via admin).
- **KYC:** `app/api/kyc/submit/route.ts`, `app/api/kyc/upload/route.ts`.
- **Admin:** `app/api/admin/bookings/route.ts`, `app/api/admin/bookings/[id]/route.ts`, `app/api/admin/bookings/[id]/confirm-payment/route.ts`; `app/api/admin/disputes/route.ts`, `app/api/admin/disputes/[id]/route.ts`, `app/api/admin/disputes/[id]/resolve/route.ts`; `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/route.ts`, `app/api/admin/users/[id]/suspend/route.ts`, `app/api/admin/users/[id]/unsuspend/route.ts`; `app/api/admin/listings/route.ts`, `app/api/admin/listings/[id]/route.ts`; `app/api/admin/kyc/route.ts`, `app/api/admin/kyc/audit/route.ts`, `app/api/admin/kyc/[userId]/route.ts`; `app/api/admin/metrics/route.ts`.

### Shared lib / util

- **`lib/utils.ts`** — `cn()` (clsx + tailwind-merge).
- **`lib/constants.ts`** — Categories (slug + Hebrew label), cities; `getCategoryLabel`, `isValidCategorySlug`.
- **`lib/availability.ts`** — `datesOverlap`, `normalizeRange`, `isDateInRange`.
- **`lib/pricing.ts`** — `getBookingSummary`, days/subtotal/fee/deposit/total/lenderPayout; `formatMoneyIls`.
- **`lib/booking-ref.ts`** — `generateUniqueBookingRef()` (LND-XXXXXX).
- **`lib/status-labels.ts`** — Hebrew labels for booking, listing, payment, deposit statuses; getters.
- **`lib/audit.ts`** — `AUDIT_ENTITY`, `createAuditLog` for admin actions.
- **`lib/admin.ts`** — Re-exports from `lib/auth/adapter` (getCurrentUser, requireUser, requireAdmin, isAdminUser).
- **`lib/booking-auth.ts`** — `requireBookingAccess`, `requireBookingMessagesAccess`; photo angle constants.
- **`lib/auth/`** — `nextauth-options.ts`, `adapter.ts`, `session-adapter.ts`, `dev-adapter.ts`, `onboarding.ts`, `types.ts`.
- **`lib/payments/adapter.ts`** — createIntent, startManualBitPayment, confirmManualPayment, confirmPayment, releaseDeposit*, splitDeposit, getPaymentSnapshot.
- **`lib/payments/types.ts`** — Types for adapter.
- **`lib/email/`** — `client.ts`, `send.ts`; templates under `lib/email/templates/` (booking-requested, -confirmed, -active, -completed, dispute-opened, -resolved).
- **`lib/notifications/booking-lifecycle.ts`** — Sends lifecycle emails (requested, confirmed, active, completed, dispute opened/resolved); best-effort, non-blocking.
- **`lib/trust/badges.ts`** — Trust badge definitions and `getListingTrustBadges` / `getUserTrustBadges`.
- **`lib/owner/dashboard.ts`** — Owner dashboard data helpers.

### Component directories

- **`components/` (root):** `app-shell.tsx`, `bottom-nav.tsx`, `admin-nav.tsx`, `session-provider.tsx`, `sign-out-button.tsx`; `listing-card.tsx`, `booking-card.tsx`, `create-booking-cta.tsx`, `listing-image-carousel.tsx`, `listings-map.tsx`, `search-input.tsx`; `trust-badges.tsx`; `camera-capture.tsx`, `id-capture.tsx`, `selfie-capture.tsx`, `kyc-flow.tsx`, `admin-kyc-review.tsx`.
- **`components/ui/`:** `button.tsx` (CVA variants), `card.tsx` (default, elevated, priceBox), `chips.tsx`, `empty-state.tsx`, `input.tsx`, `status-pill.tsx`, `sticky-cta.tsx`, `accordion.tsx`.
- **`components/listings/`:** `ListingAvailabilityCalendar.tsx`, `BlockDateRangeDialog.tsx`, `ListingAvailabilityLegend.tsx`.
- **`components/owner/`:** `OwnerStatsCards.tsx`, `OwnerQuickActions.tsx`, `OwnerListingsOverview.tsx`, `OwnerUpcomingBookings.tsx`, `OwnerAttentionList.tsx`.

### Prisma / schema / migrations

- **Schema:** `prisma/schema.prisma` — SQLite; models: User, Listing, ListingImage, ListingBlockedRange, Booking, Review, Conversation, Message, Dispute, PickupChecklist, ReturnChecklist, BookingChecklistPhoto, AuditLog; enums: ListingStatus, BookingStatus, PaymentStatus, DepositStatus, DisputeStatus, KYCStatus.
- **Migrations:** Under `prisma/migrations/` (init, payments_fields, listing_images, listing_created_at, lat_lng, kyc_fields, kyc_audit_log, listing_description, value_pickup_rules, listing_status_and_moderation_log, backfill_listing_status_active, unified_audit_log, listing_blocked_ranges, pickup_checklist, return_checklist, dispute, user_suspension, listing_owner, booking_payment_deposit_fields, booking_messages, booking_reviews, user_pilot_fields, booking_manual_bit_payment_fields, booking_ref, pickup_instructions_snapshot).

### Auth-related files

- **Config:** `lib/auth/nextauth-options.ts` (Google provider, JWT callbacks, onboarding flag on session).
- **Adapter:** `lib/auth/adapter.ts` (uses session or dev adapter), `lib/auth/session-adapter.ts`, `lib/auth/dev-adapter.ts`.
- **Helpers:** `lib/auth/onboarding.ts` (`needsOnboarding`), `lib/auth/types.ts`.
- **Middleware:** `middleware.ts` — protects `/add`, `/bookings`, `/profile`, `/checkout`, `/manage`; redirects unauthenticated to `/signin`, incomplete onboarding to `/onboarding`; excludes `_next`, static, favicon, uploads, api.
- **Pages:** `app/(main)/signin/page.tsx`, `app/(main)/onboarding/page.tsx`, `app/(main)/onboarding/onboarding-form.tsx`.
- **API:** `app/api/auth/[...nextauth]/route.ts`, `app/api/profile/onboarding/route.ts`, `app/api/me/route.ts`.

### Admin-related areas

- **Pages:** `app/(main)/admin/bookings/`, `admin/disputes/`, `admin/users/`, `admin/listings/`, `admin/kyc/`, `admin/metrics/`; shared `AdminNav` in header.
- **API:** All under `app/api/admin/` (bookings, disputes, users, listings, kyc, metrics); confirm-payment and resolve call into `lib/payments/adapter` and `lib/notifications/booking-lifecycle`, and write `AuditLog` via `lib/audit.ts`.
- **Components:** `components/admin-nav.tsx`, `components/admin-kyc-review.tsx`; admin booking detail uses `confirm-payment-form.tsx`; dispute detail uses `resolve-form.tsx`.

### Messaging / reviews / bookings / listings / disputes

- **Messaging:** Booking-scoped; `Conversation` per booking; `app/(main)/bookings/[id]/messages/page.tsx` + `messages-view.tsx`; `app/api/bookings/[id]/messages/route.ts` (GET/POST); access via `requireBookingMessagesAccess` (renter, owner, admin).
- **Reviews:** `app/api/bookings/[id]/reviews/route.ts` (GET/POST); listing stats in search/detail; `LeaveReviewForm` on booking detail when COMPLETED; admin booking page shows reviews.
- **Bookings:** Create via `POST /api/bookings/create` (overlap + blocked-range check, KYC check, ref generation, conversation creation, emails); list `GET /api/bookings`; detail `GET /api/bookings/[id]`; pickup/return checklist and dispute APIs as above.
- **Listings:** CRUD and search via `app/api/listings/*`; availability and blocked ranges via `app/api/listings/[id]/availability` and `blocked-ranges`; manage UI in `listing/[id]/manage` with `manage-client.tsx` and `ListingAvailabilityCalendar`.
- **Disputes:** Opened via `POST /api/bookings/[id]/dispute` (allowed when ACTIVE/COMPLETED/DISPUTE, no duplicate); return checklist can create dispute when damage/missing reported; admin resolve via `POST /api/admin/disputes/[id]/resolve` (owner/renter/split → deposit release + booking COMPLETED + audit + emails).

---

## 2. UI ARCHITECTURE

### Reusable UI components

- **`components/ui/button.tsx`** — CVA variants: default, gradient, pill, destructive, outline, secondary, ghost, link; sizes default, sm, lg, icon*.
- **`components/ui/card.tsx`** — Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter; variants: default, elevated, priceBox.
- **`components/ui/input.tsx`** — Styled input with focus/ring and aria-invalid.
- **`components/ui/chips.tsx`** — Filter chip (selected state) and category chip (gradient pill).
- **`components/ui/empty-state.tsx`** — Icon, title, subtitle, optional CTA (href or onClick); variant full | inline.
- **`components/ui/status-pill.tsx`** — Variants: primary, success, warning, danger, muted.
- **`components/ui/sticky-cta.tsx`** — Fixed bottom bar above nav (gradient strip, shadow).
- **`components/ui/accordion.tsx`** — Radix Accordion (used in help/FAQ etc. if needed).

### Cards, badges, buttons, inputs, modals, sheets, tabs

- **Cards:** Used consistently (listing detail, booking detail, checkout, admin, manage). No shared modal/sheet/dialog component; dialogs are local (e.g. `BlockDateRangeDialog` in listings).
- **Badges:** `StatusPill` for listing/booking status; `TrustBadges` (from `lib/trust/badges`) for identity, phone, experienced, highly_rated.
- **Buttons:** Primarily `Button` from `components/ui/button`; gradient used for primary CTAs (e.g. checkout, add listing submit).
- **Inputs:** `Input` used in forms; raw `<input>`/`<select>`/`<textarea>` in search filters and some forms (add listing, manage) with ad-hoc classes (e.g. `inputBase` in search-client).

### Empty states, filters, chips, listing cards, booking cards, trust UI, admin tables

- **Empty state:** `EmptyState` in search (no results); bookings list and admin show inline text when empty.
- **Filters:** Search has category, sort (newest/price), min/max price; implemented in `search-client.tsx` with Card + selects/inputs; no shared Filter component.
- **Chips:** Category chips on home and search (link + `Chip` category variant); filter chips on search (all + categories).
- **Listing card:** `components/listing-card.tsx` — image, title, category, location, price, optional trust badges; compact/default size; link to listing detail.
- **Booking card:** `components/booking-card.tsx` — title, subtitle (dates), status, link to booking detail; simple Card wrapper.
- **Trust UI:** `TrustBadges` + `getListingTrustBadges` / `getUserTrustBadges`; used on listing card, listing detail (lender section), profile.
- **Admin tables:** No generic DataTable; admin bookings/users/listings/disputes use lists (e.g. `users-table.tsx` for users) with inline links and actions.

### Design system / token approach

- **Centralized in `app/globals.css`:** CSS variables for radius (`--radius-sm` … `--radius-card`), shadow (`--shadow-soft`, `--shadow-medium`, `--shadow-card`, `--shadow-cta`, `--shadow-cta-strip`), colors (primary #50C878, accent, success, warning, background, card, muted, border, destructive, etc.), plus `@theme inline` for Tailwind 4. Utilities: `.rounded-sm` … `.rounded-card`, `.shadow-soft` … `.scrollbar-hide`. Body: `direction: rtl`, `text-align: right`, Heebo font.
- **No separate design-tokens file;** tokens are in globals and used via Tailwind theme and utility classes. Card/button/input styling is a mix of component-level variants and one-off classes.

### Repeated patterns and inconsistencies

- **Internal fetch:** Many server components call `fetch(proto://host/api/...)` with `headers()` for cookie/host; repeated in bookings, listing, profile, admin. No shared `getApi()` helper.
- **Status labels:** Booking/listing status labels duplicated in some admin pages (e.g. `STATUS_LABELS` in admin bookings and disputes) instead of always using `lib/status-labels.ts`.
- **Error/success messages:** Inline divs with `bg-destructive/10 text-destructive` or `bg-green-500/10`; no shared Alert/Toast component.
- **Forms:** Mix of `Input` and raw inputs with `rounded-md border border-input`; textareas often raw with similar classes. Add listing uses raw inputs and custom validation state.
- **RTL:** Root layout and body set RTL; some components add `dir="rtl"` again; LTR used for booking ref and numeric content where appropriate.

---

## 3. PAGE + FLOW MAP

### Auth / onboarding

- **Routes:** `/signin`, `/onboarding`.
- **Components:** `signin/page.tsx` (Button + Link to NextAuth signin), `onboarding/page.tsx` + `onboarding-form.tsx`.
- **Data:** `getServerSession(authOptions)` on signin; `getCurrentUser()` on onboarding; `POST /api/profile/onboarding` for saving name/phone/city.
- **UX:** Sign-in is minimal (single Google CTA). Onboarding is a single form; middleware redirects protected users without onboarding to `/onboarding` with callbackUrl.

### Homepage / landing

- **Route:** `/home` (root `/` redirects here).
- **Components:** `app/(main)/home/page.tsx` — hero with SearchInput, category chips (link to search), “קרוב אליך” placeholder ListingCards (hardcoded), trust line.
- **Data:** Static; no API. Categories from `lib/constants`.
- **UX:** Clear hero and categories; “קרוב אליך” is placeholder (same two items always).

- **Responsive / desktop audit (for future redesign):**
  - **Mobile-only feel:** Single-column layout throughout; hero inner content uses `max-w-xl` but no desktop-specific layout (e.g. no side-by-side hero + categories, no multi-column discovery). Category strip is horizontal scroll only; TrustStrip and HowItWorks remain single-column at all widths. Content is constrained by AppShell's `max-w-md`, so on large viewports the page is a narrow centered band with no use of extra horizontal space.
  - **Stretched / under-designed on larger screens:** No responsive typography scale (e.g. larger headings on md/lg); no max-width container on the outer homepage wrapper (sections span full shell width). Discovery CTA and trust/support line are full-width blocks that can feel sparse or stretched when the shell is narrow. No breakpoint-specific layout for TrustStrip or HowItWorks (e.g. horizontal step layout on desktop). Any future homepage redesign must be intentionally responsive for both mobile and desktop; this audit documents the current gaps.

### Browse / search

- **Route:** `/search` (query: q, category, min, max, sort, page, view).
- **Components:** `search/page.tsx` (wrapper) + `search-client.tsx` (state, filters, list/map toggle, ListingCard grid, ListingsMap, EmptyState).
- **Data:** `GET /api/listings/search` (client fetch); trust badges from `getListingTrustBadges` on each item.
- **UX:** Debounced search (300ms), category chips and filter card; list/map toggle; “טען עוד” pagination; empty state with CTA. Map uses `ListingsMap` (Google Maps). No URL sync for view on first load (view in URL after fetch).

### Listing detail

- **Route:** `/listing/[id]`.
- **Components:** `listing/[id]/page.tsx` — ListingImageCarousel, StatusPill, CreateBookingCTA, TrustBadges, cards for price, description, pickup/rules, liability, lender; link to manage for owner/admin.
- **Data:** `GET /api/listings/[id]` (server fetch via host); `getMe()` for owner/admin check.
- **UX:** Image-first; price box prominent; KYC-gated booking CTA (CreateBookingCTA shows KYC message or date picker + “המשך לתשלום”).

### Create / edit listing

- **Route:** `/add` (create only; no dedicated edit route; edit is pickup/rules on manage).
- **Components:** `add/page.tsx` — 5-step wizard (basic info, pricing, photos, pickup/rules, review); Card per step; file upload to `/api/listings/upload`; submit to `POST /api/listings`.
- **Data:** `POST /api/listings`, `POST /api/listings/upload`.
- **UX:** Linear steps with progress bar; validation per step; on success redirect to `listing/[id]/manage`. No draft save; back/cancel from step 1 goes home.

### Checkout / booking request

- **Route:** `/checkout?bookingId=...`.
- **Components:** `checkout/page.tsx` (client) — fetches summary from `POST /api/checkout/summary`; shows booking ref card, summary card, payment breakdown, “לתשלום ב-Bit” CTA; on CTA calls `POST /api/payments/create-intent` and redirects to `paymentLink` if present.
- **Data:** `POST /api/checkout/summary` (getPaymentSnapshot), `POST /api/payments/create-intent`.
- **UX:** Requires bookingId in query; loading state is skeleton; missing bookingId shows “חסר bookingId”. Booking ref and “יש לציין מספר הזמנה זה בעת התשלום ב-Bit” are clear. No return-URL handling after Bit (user returns manually).

### Payment instruction flow

- **Flow:** User creates booking (CreateBookingCTA on listing) → `POST /api/bookings/create` → redirect to `/checkout?bookingId=...` → user sees summary and ref → “לתשלום ב-Bit” → create-intent sets paymentLink on booking and returns it → `window.location.href = paymentLink` (Bit). After paying, user must return to app; admin confirms via admin booking detail → “אשר תשלום ידנית” → `POST /api/admin/bookings/[id]/confirm-payment` → status CONFIRMED, emails sent.
- **Weakness:** No in-app “I’ve paid” or return-from-Bit landing; reliance on admin and manual reconciliation via ref.

### Booking detail states

- **Route:** `/bookings/[id]`.
- **Components:** `bookings/[id]/page.tsx` — server; cards for status, payment summary, timeline, pickup instructions; conditional blocks: CONFIRMED → pickup checklist card + link to pickup; ACTIVE → return checklist card + link to return; COMPLETED → reviews + LeaveReviewForm; DISPUTE → message + admin link if admin; StickyCTA with getCTA() (e.g. “השלם תשלום” → checkout, “רשימת איסוף” → pickup, “רשימת החזרה” → return, “השאר ביקורת” disabled).
- **Data:** `getBooking(id)` (fetch to api/bookings/[id]), `getMe()`, `getReviews(id)`.
- **UX:** Timeline and status clear; CTA matches state. COMPLETED CTA is disabled and review form is below.

### Pickup checklist

- **Route:** `/bookings/[id]/pickup`.
- **Components:** `pickup/page.tsx` (server) + `pickup-form.tsx` (client) — checkboxes (accessories, condition), notes, photo upload (front/side/accessories); submit PUT pickup-checklist; on complete booking → ACTIVE and redirect.
- **Data:** GET/PUT `api/bookings/[id]/pickup-checklist`; photos via `api/bookings/[id]/checklist-photos`.
- **UX:** Clear required angles; completion requires both checkboxes and all three photos; success message and redirect.

### Return checklist

- **Route:** `/bookings/[id]/return`.
- **Components:** `return/page.tsx` + `return-form.tsx` — condition confirmed, damage/missing checkboxes, notes, same photo angles; PUT return-checklist; if complete with no issue → COMPLETED + release deposit + emails; if damage/missing → DISPUTE + create Dispute + emails.
- **Data:** GET/PUT `api/bookings/[id]/return-checklist`.
- **UX:** Warning when damage/missing checked; success message and redirect; dispute path clear.

### Disputes

- **User:** Booking detail when status DISPUTE shows “הזמנה בבדיקה” and link to admin dispute for admins. Dispute is created only from return checklist (damage/missing) or via API (e.g. manual).
- **Admin:** `admin/disputes` list → `admin/disputes/[id]` — dispute details, booking, return checklist, pickup/return photos; ResolveDisputeForm (owner/renter/split + note) → POST resolve → deposit release, booking COMPLETED, audit, emails.
- **Data:** `GET/POST /api/bookings/[id]/dispute`; admin GET/POST resolve.
- **UX:** Admin resolve form is simple; no dispute opening from user-facing booking page (only via return checklist).

### Messaging

- **Route:** `/bookings/[id]/messages`.
- **Components:** `messages/page.tsx` (server, fetches messages and passes to view) + `messages-view.tsx` (client) — message list, textarea, send; POST messages.
- **Data:** GET/POST `api/bookings/[id]/messages`; access via requireBookingMessagesAccess.
- **UX:** Simple thread; no real-time; sender name and “(אני)”; scrollable area.

### Reviews

- **Submission:** On booking detail when COMPLETED, `LeaveReviewForm` (rating 1–5 + optional body) → POST `api/bookings/[id]/reviews`.
- **Display:** Same page lists reviews (author → target, stars, date, body); admin booking page also shows reviews.
- **Data:** GET/POST `api/bookings/[id]/reviews`; listing aggregate in search/detail from API.
- **UX:** Star picker and textarea; no edit/delete.

### Profile / account

- **Route:** `/profile`, `/profile/kyc`.
- **Components:** `profile/page.tsx` — me from api/me; TrustBadges; link to owner dashboard; KYC card (status, link to KYC flow); admin links if admin; SignOutButton. KYC page uses kyc-flow (id/selfie capture).
- **Data:** `GET /api/me`; KYC submit/upload APIs.
- **UX:** Profile is compact; KYC status and next step clear; settings button disabled “בקרוב”.

### Trust / KYC

- **Routes:** `/profile/kyc`; admin `admin/kyc`.
- **Components:** `kyc-flow.tsx`, `id-capture.tsx`, `selfie-capture.tsx`, `camera-capture.tsx`; admin `admin-kyc-review.tsx`.
- **Data:** `POST /api/kyc/upload`, `POST /api/kyc/submit`; admin KYC APIs and audit.
- **UX:** Multi-step capture; manual admin approval; booking create and CreateBookingCTA block when KYC not APPROVED.

### Admin pages

- **Bookings:** List (ref, listing, user, status) → detail (full booking, payment, confirm-payment form when PENDING, pickup/return checklists, photos, messages link, reviews).
- **Disputes:** List → detail (dispute + booking + return context + photos + resolve form when OPEN/UNDER_REVIEW).
- **Users:** List (users-table) → detail (suspend/unsuspend actions).
- **Listings:** List → link to listing or manage.
- **KYC:** Review queue and actions.
- **Metrics:** `admin/metrics/page.tsx` (content not read in audit; API exists).
- **Data:** All via internal fetch to `api/admin/*`; admin check via api/me or requireAdmin in API.

---

## 4. DESIGN SYSTEM + STYLING

### Tailwind patterns

- Utility-first; theme uses CSS variables from globals (e.g. `bg-primary`, `text-muted-foreground`, `border-input`, `rounded-card`, `shadow-soft`). Custom utilities in `@layer utilities` for radius and shadow.
- Spacing: `space-y-*`, `gap-*`, `p-*`, `px-4`, `py-2` etc. used consistently.
- Layout: `flex`, `grid`; max-width `max-w-md` on shell and some pages.

### Typography

- Heebo (Hebrew + Latin) as primary; `--font-heebo` in layout; `font-sans` in theme. Scale: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`; headings often `text-xl font-semibold` or `font-bold`. No explicit type scale document.

### Spacing

- Page padding: `px-4`, `pt-4` in AppShell; `space-y-6` or `space-y-4` between sections; `pb-24` for bottom nav clearance. Sticky CTA uses `bottom-16` to sit above nav.

### RTL

- `dir="rtl"` and `text-align: right` on body; `text-right` and `justify-end` where needed; booking ref and numeric use `dir="ltr"`. Search icon positioned with `right-3` (correct for RTL). Some components repeat `dir="rtl"`.

### Colors

- Primary #50C878 (green); accent purple; success, warning, destructive from globals; muted for secondary text; card and background. Gradient buttons use `from-[#41B464] to-[#00B8B8]`; category chip gradient teal; price box and cards use primary/10 borders and light green tints.

### Card / button / input styling

- Cards: default (border, shadow-sm), elevated (border-[#E6F3F3], shadow-card), priceBox (gradient, primary border, shadow). Buttons: solid primary, gradient (CTA), outline, ghost, destructive. Inputs: border-input, focus ring, h-9; some forms use raw inputs with similar classes.

### Shadows / radius / borders

- Tokens: shadow-soft, medium, card, cta, cta-strip; radius sm/md/lg/xl/card. Cards and listing cards use rounded-card and shadow-card; buttons rounded-md or rounded-2xl for gradient.

### Responsiveness

- `max-w-md` on main content (AppShell); grid and flex with breakpoints (e.g. `sm:grid-cols-3` for photos); ListingsMap and search work on small screens. No dedicated tablet/desktop layouts. **Homepage:** Feels mobile-only on larger screens (single column, no desktop-optimized hero or section layout); can feel stretched or under-designed because sections don’t scale with viewport (no responsive type, no side-by-side layouts, no constrained content width for readability on wide viewports). See “Homepage / landing” above for the full responsive audit note.

### Consistency

- Generally consistent for cards, primary buttons, and spacing. Inconsistencies: raw vs Input in forms; duplicate status label objects; ad-hoc error/success divs; some hardcoded colors (e.g. green-500/10) instead of semantic tokens.

---

## 5. FEATURE MODULE INVENTORY

| Module | Status | Notes |
|--------|--------|--------|
| **Listings** | Implemented | CRUD, search (q, category, min/max, sort, page), images, status (DRAFT/PENDING_APPROVAL/ACTIVE/REJECTED/PAUSED), admin list/detail; no public edit page (only manage pickup/rules). |
| **Availability blocking** | Implemented | Blocked ranges per listing; overlap check on create; ListingAvailabilityCalendar + BlockDateRangeDialog; GET/POST/DELETE blocked-ranges API. |
| **Bookings** | Implemented | Create with overlap + KYC; ref LND-XXXXXX; lifecycle REQUESTED→CONFIRMED→ACTIVE→COMPLETED/DISPUTE; pickup/return checklists and photos; conversation auto-created. |
| **Payments** | Manual Bit only | createIntent sets amounts and paymentLink; redirect to Bit; confirm via admin only; confirmManualPayment in adapter; no Stripe/automated gateway. |
| **Messaging** | Implemented | Booking-scoped; GET/POST messages; renter/owner/admin access; no real-time. |
| **Disputes** | Implemented | Open from return (damage/missing) or API; admin resolve (owner/renter/split); deposit release and booking COMPLETED; audit and emails. |
| **Reviews** | Implemented | POST review per booking (author/target, rating 1–5, body); listing aggregates in search/detail; LeaveReviewForm when COMPLETED. |
| **KYC/trust** | Implemented | KYC flow (id/selfie); manual admin approval; trust badges (identity, phone, experienced, highly_rated); KYC required for booking create. |
| **Admin** | Implemented | Users (list, detail, suspend/unsuspend), listings, bookings (list, detail, confirm payment), disputes (list, detail, resolve), KYC, metrics; AuditLog for key actions. |
| **Emails** | Implemented | Lifecycle emails (requested, confirmed, active, completed, dispute opened/resolved) via Resend; templates in lib/email/templates; sent from lib/notifications/booking-lifecycle (best-effort). |
| **Notifications** | Email only | No in-app notifications or push; no notification center. |
| **Search/filter/sort/map** | Implemented | Search API (q, category, min, max, sort, page); list/map view; category chips; “טען עוד”; map with ListingsMap (Google). |
| **Saved/favorites** | Not implemented | No saved or favorite listings. |
| **Owner/renter dashboards** | Partial | Owner: `/owner` + OwnerStatsCards, OwnerQuickActions, OwnerListingsOverview, OwnerUpcomingBookings, OwnerAttentionList (data from lib/owner/dashboard). Renter: only “הזמנות” list (bookings). |

---

## 6. MIGRATION-SENSITIVE AREAS

- **Booking lifecycle logic:** Transitions (REQUESTED→CONFIRMED, CONFIRMED→ACTIVE via pickup, ACTIVE→COMPLETED/DISPUTE via return) are in `app/api/bookings/[id]/pickup-checklist/route.ts`, `return-checklist/route.ts`, and `lib/payments/adapter.ts` (confirmManualPayment, releaseDeposit*, splitDeposit). Changing order or adding steps requires touching these and any UI that branches on status.
- **Payment / admin confirmation:** Manual Bit flow depends on: createIntent writing paymentLink and amounts; user redirect; admin confirm-payment API calling confirmManualPayment and sendBookingConfirmedEmails. Do not replace or remove without preserving the same outcome (payment SUCCEEDED, deposit HELD, status CONFIRMED, emails).
- **Prisma schema constraints:** Unique bookingRef; Conversation.bookingId unique; Review (bookingId, authorId) unique; BookingChecklistPhoto (bookingId, type, angle) unique; Dispute.bookingId unique; PickupChecklist/ReturnChecklist one-to-one with Booking. Enums and relations drive API and UI; migrations must be additive or carefully backward-compatible.
- **Middleware / auth / onboarding gates:** Middleware matcher excludes api and static; protected paths must stay in sync with isProtectedPath. Onboarding is enforced for /add, /bookings, /checkout, /profile, /manage. JWT callback and session adapter feed onboardingComplete; changing onboarding fields requires updating nextauth-options and onboarding.ts.
- **Email triggers:** All in lib/notifications/booking-lifecycle.ts; called from booking create, admin confirm-payment, pickup-checklist PUT (ACTIVE), return-checklist PUT (COMPLETED/DISPUTE), admin dispute resolve. Adding or moving lifecycle steps should keep these triggers in mind.
- **Status-dependent UI:** Booking detail page, booking list, admin booking/dispute pages, and CTAs (getCTA) depend on booking.status and payment/deposit status. Any new status or transition must be reflected in status-labels and these UIs.
- **Admin workflows:** Admin booking detail shows confirm-payment form only when paymentStatus === PENDING; dispute resolve only when status OPEN/UNDER_REVIEW. Changing these conditions affects operator workflow.

---

## 7. OUTPUT REQUIREMENTS

### A. Concise architecture summary

Provided at the top of this document.

### B. Detailed section-by-section audit

Sections 1–6 above.

### C. Reusable components already suitable for extension

- **`components/ui/button.tsx`** — Variants and sizes; add new variants or sizes as needed.
- **`components/ui/card.tsx`** — Card composition and variants (e.g. add new variant).
- **`components/ui/input.tsx`** — Base input; can wrap or extend for search/phone etc.
- **`components/ui/chips.tsx`** — Filter and category chips; extend with more variants.
- **`components/ui/empty-state.tsx`** — Icon + title + subtitle + CTA; good for any empty list.
- **`components/ui/status-pill.tsx`** — Status badges; add variants for new statuses.
- **`components/ui/sticky-cta.tsx`** — Bottom CTA strip; reuse on any flow needing fixed CTA.
- **`components/listing-card.tsx`** — Listing preview with trust badges; extend props or variant for different contexts.
- **`components/booking-card.tsx`** — Simple booking summary card; extend for more fields or actions.
- **`components/trust-badges.tsx`** + **`lib/trust/badges.ts`** — Add badge types or thresholds in one place.
- **`components/create-booking-cta.tsx`** — KYC gate + date range + create booking; extend for different CTAs or validations.
- **`ListingAvailabilityCalendar`**, **`BlockDateRangeDialog`**, **`ListingAvailabilityLegend`** — Reuse for any listing availability UI.

### D. Weak or outdated UX areas

- **Checkout:** No “I’ve paid” or return-from-Bit flow; user may not know to come back; no deep link to booking after payment.
- **Bookings list:** Empty state is plain text; no filters (e.g. by status) or tabs.
- **Search:** View (list/map) not restored from URL on first load; filter state and URL can get out of sync until fetch.
- **Add listing:** No draft; back from step 1 exits; no edit route for listing (only manage for pickup/rules).
- **Messaging:** No real-time; no read receipts or typing; long threads may feel heavy.
- **Profile:** “הגדרות (בקרוב)” disabled; no email/phone edit in-app (only onboarding once).
- **Home “קרוב אליך”:** Placeholder data; not geo-based or personalized.
- **Admin:** No global search; lists are simple (e.g. no filters on bookings by status/date).
- **Errors:** No global toast or alert component; inline error divs only; some forms use `alert()`.
- **Accessibility:** No systematic focus management or aria-live for dynamic content; RTL and LTR usage could be documented for screen readers.

### E. Places where improvements can be safely layered without breaking architecture

- **New UI components:** Add Alert/Toast, Modal/Sheet, or DataTable in `components/ui/` and use from existing pages without changing lifecycle or API.
- **Status labels:** Replace duplicate STATUS_LABELS in admin pages with imports from `lib/status-labels.ts` (and add any new statuses there).
- **Internal API client:** Introduce a small `getApi(path, opts)` (or similar) for server-side fetch to api routes to reduce duplication and centralize host/cookie handling.
- **Checkout:** Add a “חזרתי מתשלום” or “סיימתי לשלם” button that keeps user on checkout and shows “ממתין לאישור”; no change to payment or admin flow.
- **Bookings list:** Add status filter or tabs (client or query params) and use existing GET /api/bookings (extend with query if needed); keep list/detail structure.
- **Search:** Sync view and filters to URL on initial load and use router.replace for consistency; no change to search API.
- **Owner dashboard:** Enrich `lib/owner/dashboard.ts` and owner components with more stats or links; no change to booking or listing lifecycle.
- **Profile:** Add a “ערוך פרטים” that PATCHes profile (new or existing API) for name/phone/city; keep onboarding check in middleware unchanged.
- **Emails:** Add new templates or adjust copy in `lib/email/templates/` and call from existing notification functions; keep trigger points.
- **Trust badges:** Adjust thresholds or add keys in `lib/trust/badges.ts` and optionally extend `TrustBadges` component; no schema change.
- **Admin:** Add filters (e.g. by status/date) in admin list pages using current APIs; add audit log viewer if desired; do not change confirm-payment or resolve APIs.

---

*End of audit. No code or behavior was changed; this report is descriptive only.*
