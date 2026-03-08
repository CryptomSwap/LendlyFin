# Lendly — Issue-by-Issue Port Plan (Repo A → Repo B)

This document turns each module we decided to bring from Repo A into Repo B into a discrete, actionable issue. Use it for sprint planning, assignment, and tracking. **Repo B remains the foundation;** all work is additive or adaptive on top of B.

**Conventions:**
- **Repo A** = `c:\Users\User\Lendly MVP\` (Turborepo + `lendly/` web app)
- **Repo B** = `c:\Users\User\Lendly WEB\Landly-web\`
- **Port directly** = Copy or minimal adaptation into B
- **Rebuild** = Implement in B using A only as reference (B’s stack and schema)
- **Port into B** = Add to B (model/API/UI), adapting A’s design to B’s schema

---

## Phase 1 — Safe ports (low risk)

### PORT-001: Help / FAQ / Safety / Insurance terms (static content)

| Field | Detail |
|-------|--------|
| **Type** | Port directly (copy) |
| **Phase** | 1 |
| **Dependencies** | None |

**Source (Repo A):**
- `Lendly MVP/lendly/app/[locale]/help/page.tsx`
- `Lendly MVP/lendly/app/[locale]/help/faq/page.tsx`
- `Lendly MVP/lendly/app/[locale]/help/safety/page.tsx`
- `Lendly MVP/lendly/app/[locale]/insurance-terms/page.tsx`
- `Lendly MVP/lendly/app/[locale]/help/getting-started/page.tsx` (if exists)
- `Lendly MVP/packages/shared/src/i18n.ts` (Hebrew strings for help)

**Target (Repo B):**
- `app/(main)/help/page.tsx` — help hub
- `app/(main)/help/faq/page.tsx` — FAQ (copy structure + content from A)
- `app/(main)/help/safety/page.tsx` — safety guidelines
- `app/(main)/help/insurance-terms/page.tsx` — insurance terms
- Optional: `(main)/layout.tsx` or shared layout so help routes sit under `(main)/help/*`

**Implementation steps:**
1. [ ] Create `app/(main)/help/` route group and layout (or use existing `(main)` layout).
2. [ ] Copy FAQ content (questions/answers) from A’s `help/faq/page.tsx` into B; keep Hebrew; use B’s components (e.g. `Card`, typography).
3. [ ] Copy safety page content and structure from A’s `help/safety/page.tsx`.
4. [ ] Copy insurance-terms content; add `help/insurance-terms/page.tsx` in B.
5. [ ] Add help hub page linking to FAQ, safety, insurance-terms (and getting-started if ported).
6. [ ] Add nav/footer link to `/help` (or first help subpage) in B’s app shell.

**Acceptance criteria:**
- [ ] All help routes render in Hebrew with content equivalent to A.
- [ ] No new API or DB; static or client-only.
- [ ] RTL and B’s design system preserved.

**Notes:** Extract only copy and structure; do not bring A’s layout/component tree. Prefer B’s `components/ui` and Tailwind patterns.

---

### PORT-002: Category tree (Hebrew constants)

| Field | Detail |
|-------|--------|
| **Type** | Port directly (copy / minimal adaptation) |
| **Phase** | 1 |
| **Dependencies** | None |

**Source (Repo A):**
- `Lendly MVP/packages/shared/src/constants.ts` — `CATEGORIES` (and optionally `CITIES` if B needs them)

**Target (Repo B):**
- `lib/constants.ts` (new) or extend existing `lib/utils.ts` — add `CATEGORIES` and optionally `CITIES` for Israel.

**Implementation steps:**
1. [ ] Create or open `lib/constants.ts` in B.
2. [ ] Copy `CATEGORIES` from A’s `constants.ts` (Hebrew category → subcategory → options). Adapt type to B’s TS style (e.g. `as const`).
3. [ ] Optionally copy `CITIES` if B’s search or listing flow uses city list.
4. [ ] Export from `lib/constants.ts` and use in search/add-listing flows (search filters, add-listing category dropdown).
5. [ ] Ensure listing create/search APIs or UI can consume categories (e.g. validate `category` against `CATEGORIES` keys or flattened list).

**Acceptance criteria:**
- [ ] `CATEGORIES` (and `CITIES` if added) available in B; used in at least one place (e.g. add listing or search).
- [ ] No DB migration; constants only.
- [ ] Hebrew labels preserved.

**Notes:** B’s `Listing.category` is a string; categories are for UX and validation only unless you later add a category table.

---

### PORT-003: Deposit and pricing utils (lib only)

| Field | Detail |
|-------|--------|
| **Type** | Port directly (copy/adapt into B’s lib) |
| **Phase** | 1 |
| **Dependencies** | None (utils are pure; no DB). Optional: PORT-002 if category-based risk uses `CATEGORIES` |

**Source (Repo A):**
- `Lendly MVP/packages/shared/src/constants.ts` — `DEPOSIT_CONFIG`, `RISK_CATEGORIES`, `INSURANCE_TYPES`
- `Lendly MVP/packages/shared/src/utils.ts` — `calculateDeposit`, `calculatePricing`, `formatCurrency`, `formatDate`, `formatDateRange`, `calculateDistance` (if B needs distance)

**Target (Repo B):**
- `lib/pricing.ts` (new) — deposit + pricing logic
- `lib/constants.ts` (or existing) — deposit/insurance constants
- `lib/format.ts` (new, optional) — `formatCurrency`, `formatDate`, `formatDateRange` for consistency

**Implementation steps:**
1. [ ] Add to B’s `lib/`: constants (`DEPOSIT_CONFIG`, `RISK_CATEGORIES`, `INSURANCE_TYPES`) and types (e.g. `RiskInputs`, `DepositQuote`, `PricingResult`).
2. [ ] Port `calculateDeposit` and helpers from A’s `utils.ts`; keep logic DB-agnostic (no Prisma).
3. [ ] Port `calculatePricing(dailyRate, rentalDays, hasInsurance?, insuranceType?)`; ensure it uses B’s currency convention (agorot vs shekels) if different.
4. [ ] Port `formatCurrency`, `formatDate`, `formatDateRange` for use in checkout/booking UI.
5. [ ] Add unit tests for `calculateDeposit` and `calculatePricing` (optional but recommended).
6. [ ] Do **not** yet change B’s checkout or booking create API; wire these utils when implementing dynamic deposit/insurance (Phase 3 payments).

**Acceptance criteria:**
- [ ] B has `lib/pricing.ts` (and optionally `lib/format.ts`) with the same behavioral contract as A’s shared utils for deposit and pricing.
- [ ] No Prisma or API changes in this issue.
- [ ] Constants and types exported and usable from B’s app.

**Notes:** B currently uses static `Listing.deposit`; this issue only adds the *logic* so it can be used later when B adds dynamic deposit/insurance.

---

### PORT-004: Report issue (page + API)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 1 |
| **Dependencies** | None (can store in DB or send email; minimal auth if B has none) |

**Source (Repo A):**
- `Lendly MVP/apps/server/src/app/api/safety/report-issue/route.ts` — request body, validation, persistence/email
- `Lendly MVP/lendly/app/[locale]/report-issue/page.tsx` — form and copy

**Target (Repo B):**
- `app/api/safety/report-issue/route.ts` (new)
- `app/(main)/report-issue/page.tsx` (new) — form UI, Hebrew copy from A

**Implementation steps:**
1. [ ] Read A’s `api/safety/report-issue/route.ts`: payload shape (e.g. bookingId?, type, description, reporterId?), validation, and how it persists (DB table vs email).
2. [ ] In B: add `app/api/safety/report-issue/route.ts`. Implement POST with body validation (e.g. Zod). Either: (a) insert into a new `ReportedIssue` or `SafetyReport` table in B, or (b) send email via B’s preferred channel. Use B’s `getCurrentUser()` if available to attach reporter.
3. [ ] Create `app/(main)/report-issue/page.tsx`: form (type dropdown, textarea, optional booking selector); copy Hebrew labels from A; onSubmit call B’s new API.
4. [ ] If using DB: add Prisma model (e.g. `ReportedIssue`: id, userId?, bookingId?, type, description, createdAt) and run migration.
5. [ ] Add link to report-issue from help/safety or footer/app shell.

**Acceptance criteria:**
- [ ] User can submit a report from B; data is stored or emailed.
- [ ] API validates input and returns clear errors.
- [ ] Page uses B’s design system and Hebrew copy aligned with A.

**Notes:** If B has no auth, allow anonymous reports with optional email field; otherwise attach `userId` from session.

---

## Phase 2 — Product flow integrations

### PORT-005: Listing creation wizard (4-step add flow)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 2 |
| **Dependencies** | PORT-002 (categories). B’s listing API: ensure `POST /api/listings` or equivalent exists and accepts title, pricePerDay, deposit, city, category, images (or ListingImage creation). |

**Source (Repo A):**
- `Lendly MVP/lendly/app/[locale]/listings/new/page.tsx` — wizard state, steps, submit
- `Lendly MVP/lendly/components/list-item-step-basic-info.tsx`
- `Lendly MVP/lendly/components/list-item-step-photos.tsx`
- `Lendly MVP/lendly/components/list-item-step-pricing.tsx`
- `Lendly MVP/lendly/components/list-item-step-availability.tsx`
- `Lendly MVP/lendly/components/photo-upload.tsx`
- `Lendly MVP/lendly/lib/actions/listings.ts` (createListing server action, if present)

**Target (Repo B):**
- `app/(main)/add/page.tsx` — replace placeholder with wizard container (steps 1–4)
- `components/add-listing/` (new) — e.g. `step-basic-info.tsx`, `step-photos.tsx`, `step-pricing.tsx`, `step-availability.tsx`
- `components/photo-upload.tsx` (new, or reuse pattern from A) — upload UI; backend: reuse B’s KYC upload pattern or add `api/listings/upload` for listing images
- B’s `app/api/listings/route.ts` — ensure POST creates Listing + ListingImage records (or accept image URLs from client)

**Implementation steps:**
1. [ ] Design wizard state in B: currentStep (1–4), formData (title, description, category, pricePerDay, deposit, photos, locationText, lat/lng, availability/blockedDates if B supports). Use B’s `(main)/add` layout.
2. [ ] Step 1 — Basic info: title, description, category (use PORT-002 CATEGORIES). Match A’s validation and Hebrew labels; use B’s Input/Card.
3. [ ] Step 2 — Photos: multi-photo upload. Reference A’s `list-item-step-photos.tsx` and `photo-upload.tsx`. In B: either call existing upload API (e.g. extend KYC-style upload for listing images) or base64/temp upload; persist via ListingImage or Listing.images when submitting.
4. [ ] Step 3 — Pricing: pricePerDay, optional deposit override. Use PORT-003 formatCurrency if wired.
5. [ ] Step 4 — Availability (optional for this issue): if B has no availability yet, skip or add simple “blocked dates” UI; otherwise implement PORT-007 first and reuse here.
6. [ ] Submit: call B’s `POST /api/listings` (or create listing API) with aggregated formData; create Listing + ListingImage; redirect to listing detail or “my listings.”
7. [ ] Add client-side validation (required fields, min/max price) and server-side validation in listing create API.

**Acceptance criteria:**
- [ ] User can complete all steps and create a listing in B; listing appears in B’s DB and on listing detail/search.
- [ ] Images are stored (ListingImage or equivalent); categories from PORT-002.
- [ ] UI and copy follow A’s flow and Hebrew; components are B’s design system.

**Notes:** Do not copy A’s server actions; B uses Route Handlers. Adapt A’s createListing logic to B’s API and schema (Listing, ListingImage).

---

### PORT-006: Listing approval workflow (admin)

| Field | Detail |
|-------|--------|
| **Type** | Port into B (adapt to B schema) |
| **Phase** | 2 |
| **Dependencies** | B’s Listing model must have a status field (e.g. PENDING, APPROVED, REJECTED, PAUSED). If missing, add via migration. B’s admin auth: `requireAdmin` in place. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Listing.status (PENDING, APPROVED, REJECTED, PAUSED)
- `Lendly MVP/lendly/app/api/admin/listings/[id]/approve/route.ts`
- `Lendly MVP/lendly/app/api/admin/listings/[id]/pause/route.ts`
- `Lendly MVP/lendly/app/api/admin/listings/[id]/reject/route.ts`
- `Lendly MVP/lendly/lib/actions/admin.ts` — getAdminListings (filters by status, etc.)
- `Lendly MVP/lendly/app/[locale]/admin/listings/page.tsx` — admin listings table and actions

**Target (Repo B):**
- `prisma/schema.prisma` — add `status` to Listing if not present (e.g. `ListingStatus` enum: PENDING, APPROVED, REJECTED, PAUSED); run migration
- `app/api/admin/listings/route.ts` (new) — GET list with status filter, pagination; require admin
- `app/api/admin/listings/[id]/approve/route.ts` (new) — PATCH/POST set status APPROVED
- `app/api/admin/listings/[id]/reject/route.ts` (new) — PATCH/POST set status REJECTED, optional reason
- `app/api/admin/listings/[id]/pause/route.ts` (new) — PATCH/POST set status PAUSED
- `app/(main)/admin/listings/page.tsx` (new) — list pending/approved/rejected; buttons to approve/reject/pause; use B’s admin layout

**Implementation steps:**
1. [ ] Add `status` to Listing in B’s Prisma schema (enum or string); default new listings to PENDING. Migrate.
2. [ ] Implement GET `api/admin/listings`: query Listings with optional ?status=, ?page=, ?pageSize=; require admin via `requireAdmin()`. Return JSON list.
3. [ ] Implement approve/reject/pause routes: resolve listing by id, check admin, update status; for reject, optionally store reason (add field if needed).
4. [ ] Build admin listings page: fetch from GET admin/listings; table with listing title, owner, category, status, createdAt; actions: Approve, Reject, Pause. Use B’s components and Hebrew labels from A.
5. [ ] Ensure search/listing detail in B only shows APPROVED listings (or respect status in public APIs).
6. [ ] Optional: getAdminListings filters (category, owner email) like A; add to GET admin/listings query params.

**Acceptance criteria:**
- [ ] Admin can see pending listings and approve/reject/pause them.
- [ ] Listing status is persisted; public listing APIs respect status.
- [ ] All admin routes are protected by B’s admin check.

**Notes:** Reuse B’s `lib/admin.ts` requireAdmin pattern; do not port A’s server actions, only route handlers.

---

### PORT-007: Availability / blocked dates

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 2 |
| **Dependencies** | Listing model in B. Best implemented with PORT-005 so the add flow includes an availability step. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Listing.availability (JSON string)
- `Lendly MVP/lendly/components/list-item-step-availability.tsx` — UI for blocked date ranges

**Target (Repo B):**
- `prisma/schema.prisma` — add `availability` to Listing (String? or Json?) to store blocked ranges or calendar data; migrate
- `app/(main)/add/` — step 4 of wizard (PORT-005): availability/blocked dates component
- Optional: `app/api/listings/[id]/availability/route.ts` — GET/PUT for availability if edited separately from create

**Implementation steps:**
1. [ ] Add `availability` field to Listing in B (e.g. `String?` storing JSON array of `{ from, to }` or similar). Run migration.
2. [ ] Build availability step component: reference A’s `list-item-step-availability.tsx` (date range picker, list of blocked ranges). Use B’s date picker (e.g. react-day-picker if in B) and B’s components.
3. [ ] On listing create (PORT-005), include availability in payload and persist to Listing.availability.
4. [ ] When calculating booking availability (in booking create or search), read Listing.availability and exclude blocked dates from available ranges. Implement or extend B’s booking create validation.
5. [ ] Optional: listing edit page or settings to update availability after create; add PUT `api/listings/[id]` or dedicated availability endpoint.

**Acceptance criteria:**
- [ ] Listings can store blocked dates; add-listing wizard can set them.
- [ ] Booking create (or availability check) respects blocked dates and rejects overlapping requests.
- [ ] UI and data shape aligned with A’s concept; implementation uses B’s schema.

**Notes:** A uses JSON string; B can use Prisma Json type if supported with SQLite, or keep as string.

---

### PORT-008: Admin metrics dashboard

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 2 |
| **Dependencies** | B’s admin auth; Listing and Booking (and optionally Dispute after PORT-011) in B. |

**Source (Repo A):**
- `Lendly MVP/lendly/lib/actions/admin.ts` — getAdminMetrics (counts: activeListings, pendingApprovals, openDisputes, totalDisputes; bookings; GMV; conversionRate)
- `Lendly MVP/lendly/app/api/admin/metrics/route.ts`
- `Lendly MVP/lendly/app/[locale]/admin/metrics/page.tsx` — dashboard UI

**Target (Repo B):**
- `app/api/admin/metrics/route.ts` (new) — GET; require admin; return metrics JSON
- `app/(main)/admin/metrics/page.tsx` (new) or `app/(main)/admin/page.tsx` — cards/table for metrics

**Implementation steps:**
1. [ ] Implement getAdminMetrics logic in B: count Listings by status (APPROVED, PENDING), count Bookings (total, completed), compute GMV (sum of booking totals for completed/confirmed), conversion rate (completed / total bookings). If Dispute exists (PORT-011), add openDisputes and totalDisputes.
2. [ ] Expose as GET `api/admin/metrics`; protect with requireAdmin().
3. [ ] Build admin metrics page: fetch from API; display cards (active listings, pending approvals, GMV, conversion %, disputes if applicable). Use B’s Card and typography; Hebrew labels from A.
4. [ ] Link metrics page from admin layout (e.g. admin nav: KYC, Listings, Disputes, Metrics).

**Acceptance criteria:**
- [ ] Admin can open metrics page and see counts and GMV/conversion.
- [ ] Numbers match B’s DB (Listing/Booking statuses).
- [ ] Only admins can access the route and page.

**Notes:** If B does not yet have listing status (PORT-006), use “all listings” vs “approved” or skip pending-approval count until PORT-006 is done.

---

### PORT-009: Pickup checklist (model + API + UI)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 2 |
| **Dependencies** | Booking model in B. Optional: PORT-011 (Dispute) if damage during pickup opens a dispute. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Checklist model (bookingId, phase PICKUP|RETURN, photos, serial?, conditionNotes, signedAt)
- `Lendly MVP/lendly/app/[locale]/bookings/[id]` — booking detail and link to pickup flow
- A’s pickup UI: checklist steps (photo item, confirm condition, sign); reference B’s current `app/(main)/bookings/[id]/pickup/page.tsx` (placeholder)

**Target (Repo B):**
- `prisma/schema.prisma` — add Checklist model (id, bookingId, phase enum PICKUP|RETURN, photos Json or String, conditionNotes String?, signedAt DateTime?); migrate
- `app/api/bookings/[id]/checklist/route.ts` (new) — GET checklist(s) for booking; POST to create/update pickup checklist (photos, conditionNotes, signedAt)
- `app/(main)/bookings/[id]/pickup/page.tsx` — replace placeholder with full UI: photo upload, condition confirmation, submit; call API to save checklist and optionally update booking status to ACTIVE

**Implementation steps:**
1. [ ] Add Checklist model to B’s schema (phase, bookingId, photos, conditionNotes, signedAt). Run migration.
2. [ ] Implement GET `api/bookings/[id]/checklist`: return checklists for booking (filter by phase if needed). Require auth; user must be renter or owner of booking.
3. [ ] Implement POST (or PATCH) to create/update pickup checklist: accept photos (URLs or upload), conditionNotes; set signedAt on confirm. Optionally set Booking.status to ACTIVE when pickup is confirmed.
4. [ ] Rebuild pickup page: steps (1) photo item from multiple angles, (2) confirm condition, (3) sign/confirm. Use B’s Card, Button, and upload pattern (e.g. like KYC). Copy Hebrew copy from A’s pickup flow.
5. [ ] Link from booking detail page: “רשימת איסוף” → `/bookings/[id]/pickup` when booking is in CONFIRMED or appropriate status.

**Acceptance criteria:**
- [ ] Renter (or owner) can complete pickup checklist; data persisted in Checklist with phase PICKUP.
- [ ] Booking can transition to ACTIVE after pickup confirmation if product rule says so.
- [ ] UI uses B’s design system and Hebrew.

**Notes:** Photo upload can reuse B’s existing upload (e.g. public folder + URL) or a small dedicated endpoint for checklist photos.

---

### PORT-010: Return checklist (model + API + UI)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 2 |
| **Dependencies** | PORT-009 (Checklist model and API exist); Booking in B. |

**Source (Repo A):**
- Same Checklist model; phase RETURN. A’s return flow: condition check, damage flag (can open dispute), sign.

**Target (Repo B):**
- Same Checklist model; add phase RETURN. Reuse `app/api/bookings/[id]/checklist/route.ts` for return checklist (POST with phase RETURN).
- `app/(main)/bookings/[id]/return/page.tsx` — replace single-line placeholder with full return checklist UI; optional “report damage” that sets booking to DISPUTE or creates Dispute (if PORT-011 done).

**Implementation steps:**
1. [ ] Reuse Checklist API: POST with phase=RETURN, photos, conditionNotes, signedAt. Optionally accept “damageReported: boolean” or similar to trigger dispute flow (PORT-011).
2. [ ] Rebuild return page: (1) photo item on return, (2) condition check, (3) “דווח נזק” / report damage (if yes, redirect to dispute or set status), (4) sign/confirm. On confirm: set signedAt; optionally set Booking.status to COMPLETED.
3. [ ] Copy Hebrew copy from A (including “סימון נזק יפתח מחלוקת אוטומטית”).
4. [ ] Link from booking detail: “רשימת החזרה” → `/bookings/[id]/return` when booking is ACTIVE or near end date.

**Acceptance criteria:**
- [ ] Return checklist can be completed and stored with phase RETURN.
- [ ] Damage reporting path exists (even if dispute UI comes in PORT-011).
- [ ] Booking can transition to COMPLETED after return confirmation.

**Notes:** If Dispute is not yet in B, “report damage” can only set Booking.status to DISPUTE and show a message; full dispute resolution comes in PORT-011.

---

### PORT-011: Disputes (model + admin API + admin UI)

| Field | Detail |
|-------|--------|
| **Type** | Port into B (model + API + admin UI) |
| **Phase** | 2 |
| **Dependencies** | Booking model; admin auth. PORT-009/PORT-010 can optionally create or link a Dispute when damage is reported. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Dispute (bookingId, openedById?, type DAMAGE|PAYMENT|OTHER, description?, status OPEN|IN_REVIEW|RESOLVED_OWNER|RESOLVED_RENTER|REFUND_PARTIAL, claim, evidence JSON, notes?)
- `Lendly MVP/lendly/app/api/admin/disputes/[id]/status/route.ts` — POST update status and notes
- `Lendly MVP/lendly/lib/actions/admin.ts` — updateDisputeStatus, getAdminListings; dispute list logic
- `Lendly MVP/lendly/app/[locale]/admin/disputes/page.tsx` — list disputes, open detail, update status

**Target (Repo B):**
- `prisma/schema.prisma` — add Dispute model (and enums DisputeType, DisputeStatus); add relation Booking.disputes; migrate
- `app/api/admin/disputes/route.ts` (new) — GET list disputes (filter by status); require admin
- `app/api/admin/disputes/[id]/route.ts` (new) — GET one; PATCH status and notes
- `app/api/admin/disputes/[id]/status/route.ts` (new) — POST update status (and notes) — or fold into PATCH [id]
- `app/(main)/admin/disputes/page.tsx` (new) — table of disputes; click to see detail; form to set status (e.g. RESOLVED_OWNER, REFUND_PARTIAL) and notes
- Optional: `app/api/bookings/[id]/disputes/route.ts` — POST create dispute (called from return flow when user reports damage)

**Implementation steps:**
1. [ ] Add Dispute and enums to B’s Prisma schema; add `disputes Dispute[]` to Booking. Migrate.
2. [ ] Implement GET admin/disputes: list with optional ?status=; require admin.
3. [ ] Implement GET admin/disputes/[id] and PATCH (or POST status): update status and notes; require admin.
4. [ ] Optional: POST bookings/[id]/disputes: create dispute (openedBy = current user, type, description, claim, evidence); used from return page “report damage.”
5. [ ] Build admin disputes page: fetch list; show booking, parties, type, status, claim; detail view with status dropdown and notes textarea; submit updates to PATCH. Use B’s components and Hebrew labels from A.
6. [ ] When status is updated to a resolution (e.g. RESOLVED_OWNER), optionally trigger payment/refund logic later (Phase 3); for now, only persist status.

**Acceptance criteria:**
- [ ] Disputes can be created (from return flow or admin) and listed in admin.
- [ ] Admin can update dispute status and notes.
- [ ] All admin dispute routes protected; UI in Hebrew and B’s design system.

**Notes:** Non-return flow (e.g. RESOLVED_OWNER, REFUND_PARTIAL) is just status in this issue; actual refund/payment handling is Phase 3.

---

## Phase 3 — Deeper integrations

### PORT-012: Payments — deposit and insurance logic in checkout

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference (wire PORT-003 into B’s checkout when real payments exist) |
| **Phase** | 3 |
| **Dependencies** | PORT-003 (pricing/deposit utils); B’s checkout and payment intent/confirm flow; decision on Stripe (or other) integration. |

**Source (Repo A):**
- `Lendly MVP/packages/shared/src/utils.ts` — calculatePricing, calculateDeposit
- `Lendly MVP/apps/server/src/app/api/risk/deposit/route.ts` — deposit quote API
- `Lendly MVP/apps/server/src/app/api/bookings/route.ts` — booking create uses calculatePricing
- `Lendly MVP/apps/server/src/app/api/payments/manual/confirm/route.ts` — manual confirm (reference only)

**Target (Repo B):**
- `app/api/checkout/summary/route.ts` — use PORT-003 calculatePricing (and optionally calculateDeposit) to compute rentalSubtotal, depositAmount, insuranceAmount
- `app/api/payments/create-intent/route.ts` — when replacing mock with Stripe, use summary amounts (deposit + rental) for intent amount
- `app/api/payments/confirm/route.ts` — confirm booking payment status; optionally release/refund deposit per dispute resolution
- `lib/pricing.ts` — already from PORT-003

**Implementation steps:**
1. [ ] Replace or extend B’s checkout summary to use `calculatePricing` from PORT-003 (dailyRate, days, hasInsurance, insuranceType). Return rentalSubtotal, depositAmount, insuranceAmount to client.
2. [ ] If B adds “risk-based deposit” API: add GET/POST `api/risk/deposit` or equivalent that returns deposit quote using `calculateDeposit` from PORT-003 (itemValue, duration, category, etc.).
3. [ ] When integrating Stripe: create payment intent with amount = rental + deposit (and insurance if applicable); on confirm, update Booking.paymentStatus and any deposit hold.
4. [ ] Document flow: booking create → summary (with PORT-003) → create-intent → confirm; deposit release/refund when return checklist is done or dispute resolved (can be follow-up).
5. [ ] Keep manual-confirm option if product requires it (reference A’s manual confirm); implement in B’s confirm route.

**Acceptance criteria:**
- [ ] Checkout summary amounts are computed with PORT-003 logic (and optional risk deposit).
- [ ] Payment intent (when real) uses correct totals; confirm updates booking state.
- [ ] No breaking change to B’s existing checkout UX; add dynamic deposit/insurance only when product agrees.

**Notes:** This issue assumes B will integrate a real payment provider; scope to “wire pricing/deposit into existing B flows,” not implement Stripe from zero.

---

### PORT-013: Messages / chat (Thread + Message, API + UI)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 3 |
| **Dependencies** | Booking model; auth (current user). |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Thread (bookingId, lastMessageAt), Message (threadId?, bookingId, fromUserId, body, images?)
- `Lendly MVP/lendly/app/api/messages/threads/route.ts` — list threads for user (by booking)
- `Lendly MVP/lendly/app/[locale]/messages/page.tsx` — threads list and possibly thread detail

**Target (Repo B):**
- `prisma/schema.prisma` — add Thread (bookingId unique), Message (threadId, bookingId, fromUserId, body, images?); migrate
- `app/api/messages/threads/route.ts` (new) — GET threads for current user (join Booking, filter by renter or owner)
- `app/api/messages/threads/[id]/route.ts` (new) — GET messages for thread; POST new message (require auth, user must be in booking)
- `app/(main)/messages/page.tsx` (new) — list threads; click to open thread and messages; send message form
- Optional: `app/(main)/bookings/[id]/messages/page.tsx` or inline in booking detail — open thread for that booking

**Implementation steps:**
1. [ ] Add Thread and Message models to B; link to Booking. Run migration.
2. [ ] GET threads: for current user, find Bookings where user is renter or owner; for each, get or create Thread; return list with lastMessageAt, other party, listing title.
3. [ ] GET thread [id]: return messages ordered by createdAt; ensure user is participant. POST: create Message, update Thread.lastMessageAt.
4. [ ] Build messages page: sidebar or list of threads; main area shows messages; input to send. Use B’s components; Hebrew labels. Optional: real-time (polling or WebSocket) in a later iteration.
5. [ ] Link to messages from booking detail (“הודעות”) and from main nav.

**Acceptance criteria:**
- [ ] User can see threads for their bookings and send/receive messages.
- [ ] Only participants of the booking can see the thread and post.
- [ ] Data persisted; UI in B’s design system and Hebrew.

**Notes:** A’s Message has bookingId and optional threadId; B can use one thread per booking and keep bookingId on Message for simplicity.

---

### PORT-014: Reviews (model + UI)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 3 |
| **Dependencies** | Listing, Booking, User; completed bookings. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Review (listingId, fromUserId, toUserId, rating 1–5, text?)
- `Lendly MVP/apps/server/prisma/schema.prisma` — Review (itemId, reviewerId, rating, comment)

**Target (Repo B):**
- `prisma/schema.prisma` — add Review (listingId, fromUserId, toUserId, rating Int, text String?); migrate
- `app/api/listings/[id]/reviews/route.ts` (new) — GET reviews for listing; POST create review (require auth; fromUserId = current user, toUserId = listing owner; only after completed booking)
- `app/api/me/reviews/route.ts` (optional) — GET reviews received by current user
- Listing detail page: show reviews; after completed booking, show “leave review” form (rating + text)
- Profile or “reviews about you”: list reviews received (optional)

**Implementation steps:**
1. [ ] Add Review model to B; relations to Listing, User (from, to). Migrate.
2. [ ] GET listings/[id]/reviews: return reviews for listing (with fromUser name, rating, text, createdAt).
3. [ ] POST listings/[id]/reviews: validate user completed a booking for this listing with listing owner; create Review (fromUserId = current user, toUserId = owner, rating, text).
4. [ ] On listing detail page: fetch and display reviews; show review form only if user has a completed booking with this listing’s owner.
5. [ ] Optional: profile page section “reviews about you” (reviews where toUserId = current user).
6. [ ] Optional: aggregate rating on Listing (e.g. ratingAvg, ratingCount) and update on new review; add fields to Listing if not present.

**Acceptance criteria:**
- [ ] Users can leave a review after a completed booking; reviews appear on listing and (optionally) on profile.
- [ ] Only one review per (fromUser, listing) or (fromUser, toUser, listing) as per product rule.
- [ ] Hebrew labels and B’s design system.

**Notes:** Decide whether review is “renter → owner” only or also “owner → renter”; A’s lendly has fromUser/toUser (listing owner vs renter).

---

### PORT-015: Admin users — ban / trust / verify

| Field | Detail |
|-------|--------|
| **Type** | Port into B when admin user management exists |
| **Phase** | 3 |
| **Dependencies** | Admin auth; User model in B (with optional bannedAt, trustScore, etc.). |

**Source (Repo A):**
- `Lendly MVP/lendly/app/api/admin/users/[id]/ban/route.ts`
- `Lendly MVP/lendly/app/api/admin/users/[id]/trust/route.ts`
- `Lendly MVP/lendly/app/api/admin/users/[id]/verify/route.ts`
- `Lendly MVP/lendly/app/[locale]/admin/users/page.tsx` — user list and actions

**Target (Repo B):**
- `prisma/schema.prisma` — add User fields if needed: bannedAt DateTime?, trustScore Float?, or isVerified (may exist)
- `app/api/admin/users/route.ts` (new) — GET list users (optional filters)
- `app/api/admin/users/[id]/ban/route.ts` (new) — POST/PATCH set banned (or bannedAt)
- `app/api/admin/users/[id]/trust/route.ts` (new) — PATCH trustScore (optional)
- `app/api/admin/users/[id]/verify/route.ts` (new) — PATCH isVerified (optional)
- `app/(main)/admin/users/page.tsx` (new) — list users; actions: Ban, Set trust, Verify

**Implementation steps:**
1. [ ] Add bannedAt (or isBanned) and optionally trustScore to User in B; migrate.
2. [ ] GET admin/users: list users with pagination; require admin.
3. [ ] Implement ban: set bannedAt = now (or isBanned = true); ensure auth middleware rejects banned users on sensitive routes.
4. [ ] Implement trust and verify routes if product needs them; update User fields.
5. [ ] Build admin users page: table with user name, email, trust, verified, banned; buttons to ban/unban, set trust, verify. Use B’s components and Hebrew.
6. [ ] Enforce ban in B’s auth: getCurrentUser or middleware returns 403 if user is banned.

**Acceptance criteria:**
- [ ] Admin can ban a user; banned user cannot perform sensitive actions (book, list, etc.).
- [ ] Optional: trust and verify editable by admin; visible in admin and optionally on profile.
- [ ] All admin user routes protected.

**Notes:** KYC in B is separate (already in admin/kyc); “verify” here can be a general account verification flag unless you merge with KYC status.

---

### PORT-016: Cron — expire bookings

| Field | Detail |
|-------|--------|
| **Type** | Port into B |
| **Phase** | 3 |
| **Dependencies** | Booking model with status and optional expiresAt or createdAt; cron runner (e.g. Vercel Cron, or external job). |

**Source (Repo A):**
- `Lendly MVP/lendly/app/api/cron/expire-bookings/route.ts` — logic to find REQUESTED (or PENDING) bookings past expiry and update status to CANCELLED or EXPIRED

**Target (Repo B):**
- `app/api/cron/expire-bookings/route.ts` (new) — same logic; protect with cron secret (e.g. CRON_SECRET header) so only scheduler can call
- B’s Booking: ensure there is an expiry rule (e.g. REQUESTED bookings expire after 24h; use expiresAt or createdAt + TTL)

**Implementation steps:**
1. [ ] Define expiry rule in B: e.g. Booking with status REQUESTED and createdAt (or expiresAt) older than X hours → set status to CANCELLED or new status EXPIRED.
2. [ ] Implement route: query such bookings; update status; return count. Use Prisma transaction if needed.
3. [ ] Protect route: check Authorization header or CRON_SECRET so only Vercel Cron (or your scheduler) can call it.
4. [ ] Configure Vercel cron (vercel.json) or external cron to hit this route on a schedule (e.g. every hour).
5. [ ] Optional: add expiresAt to Booking and set it when booking is created as REQUESTED (e.g. createdAt + 24h).

**Acceptance criteria:**
- [ ] REQUESTED bookings that pass the expiry threshold are updated to expired/cancelled.
- [ ] Cron route is not callable without secret; no side effects for normal users.

**Notes:** Align with Phase 0 “booking lifecycle” decision (when does REQUESTED expire).

---

### PORT-017: Audit log (general)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 3 |
| **Dependencies** | Admin; optional: disputes, listing approval, user actions. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — AuditLog (actorId, action, entity, entityId, data?)

**Target (Repo B):**
- `prisma/schema.prisma` — add AuditLog (actorId, action, entity, entityId, data String?); migrate
- Helper: `lib/audit.ts` — log(actorId, action, entity, entityId, data?)
- Call audit from: admin dispute status update (PORT-011), listing approve/reject (PORT-006), user ban (PORT-015), KYC approve/reject (existing)
- `app/api/admin/audit/route.ts` (new) — GET list audit logs (filter by entity, actor, date); require admin
- `app/(main)/admin/audit/page.tsx` (optional) — table of recent logs

**Implementation steps:**
1. [ ] Add AuditLog model to B; migrate.
2. [ ] Create audit helper that inserts into AuditLog (actorId from session, action e.g. "DISPUTE_RESOLVED", entity "Dispute", entityId, data JSON string).
3. [ ] In dispute status update, listing approve/reject, user ban, KYC approve/reject: call audit helper after success.
4. [ ] GET admin/audit: query with pagination and optional filters; require admin.
5. [ ] Optional: admin audit page to browse logs; use B’s table and filters.

**Acceptance criteria:**
- [ ] Key admin actions (dispute, listing, user, KYC) write an audit log entry.
- [ ] Admin can read audit logs via API (and optionally UI).
- [ ] B’s KYCAuditLog remains for KYC-specific history; AuditLog is general.

**Notes:** Keep KYCAuditLog unchanged; AuditLog is for broader admin actions.

---

### PORT-018: Admin rules / settings (optional)

| Field | Detail |
|-------|--------|
| **Type** | Rebuild in B using A as reference |
| **Phase** | 3 |
| **Dependencies** | Admin auth. Optional for product. |

**Source (Repo A):**
- `Lendly MVP/lendly/prisma/schema.prisma` — Rules (baseDepositPct, minDeposit, maxDeposit, insuranceDaily, incidentMultiplier, ownerTrustMultiplier, renterTrustMultiplier), AdminSettings (key-value)
- `Lendly MVP/lendly/app/api/admin/rules/route.ts` — GET/PATCH rules

**Target (Repo B):**
- `prisma/schema.prisma` — add Rules table (singleton or key-value) or AdminSettings; migrate
- `app/api/admin/rules/route.ts` (new) — GET current rules; PATCH update (require admin)
- `app/(main)/admin/rules/page.tsx` (new) — form to edit deposit %, min/max deposit, insurance daily rate, etc.; use values in PORT-003 or checkout when present

**Implementation steps:**
1. [ ] Add Rules or AdminSettings to B; store values used by PORT-003 (e.g. baseDepositPct, minDeposit, maxDeposit, insuranceDaily). If using singleton Rules, use fixed id "1" like A.
2. [ ] GET admin/rules: return current rules; PATCH: validate and update. Require admin.
3. [ ] Update lib/pricing.ts (or constants) to read from DB when available (e.g. at startup or per-request); fallback to PORT-003 constants if no rules row.
4. [ ] Build admin rules page: form fields for each rule; save via PATCH. Hebrew labels.
5. [ ] Ensure checkout/summary and deposit calculation use rules when configured.

**Acceptance criteria:**
- [ ] Admin can view and edit platform rules (deposit %, limits, insurance rate).
- [ ] Pricing/deposit logic in B uses these rules when set.
- [ ] Optional: if not needed for MVP, mark as backlog and skip.

**Notes:** Low priority unless product needs configurable deposit/insurance without code deploy.

---

## Summary table

| Issue ID | Module | Type | Phase | Dependencies |
|----------|--------|------|-------|--------------|
| PORT-001 | Help / FAQ / Safety / Insurance terms | Port directly | 1 | None |
| PORT-002 | Category tree (Hebrew constants) | Port directly | 1 | None |
| PORT-003 | Deposit and pricing utils | Port directly | 1 | None |
| PORT-004 | Report issue | Rebuild | 1 | None |
| PORT-005 | Listing creation wizard | Rebuild | 2 | PORT-002; listing API |
| PORT-006 | Listing approval workflow | Port into B | 2 | Listing.status; admin |
| PORT-007 | Availability / blocked dates | Rebuild | 2 | Listing; PORT-005 |
| PORT-008 | Admin metrics dashboard | Rebuild | 2 | Admin; Listing; Booking |
| PORT-009 | Pickup checklist | Rebuild | 2 | Booking |
| PORT-010 | Return checklist | Rebuild | 2 | PORT-009 |
| PORT-011 | Disputes | Port into B | 2 | Booking; admin |
| PORT-012 | Payments (deposit/insurance in checkout) | Rebuild | 3 | PORT-003; Stripe decision |
| PORT-013 | Messages / chat | Rebuild | 3 | Booking; auth |
| PORT-014 | Reviews | Rebuild | 3 | Listing; Booking; User |
| PORT-015 | Admin users (ban/trust/verify) | Port into B | 3 | Admin; User |
| PORT-016 | Cron expire bookings | Port into B | 3 | Booking lifecycle; cron |
| PORT-017 | Audit log | Rebuild | 3 | Admin |
| PORT-018 | Admin rules / settings | Rebuild | 3 | Admin (optional) |

---

## Suggested implementation order (by phase)

**Phase 1 (no schema dependency):** PORT-001 → PORT-002 → PORT-003 → PORT-004. Can parallelize 001/002/003.

**Phase 2 (schema + flows):** PORT-006 (listing status) first so listing create can set PENDING. Then PORT-005 (wizard); PORT-007 (availability) can be part of PORT-005 or follow. PORT-008 (metrics), PORT-009 (pickup), PORT-010 (return), PORT-011 (disputes) can proceed after; PORT-009 before PORT-010; PORT-011 can be parallel to 008/009/010 once Booking exists.

**Phase 3 (payments, social, ops):** PORT-012 after Stripe (or payment) decision. PORT-013 (messages), PORT-014 (reviews), PORT-015 (admin users), PORT-016 (cron), PORT-017 (audit) can be ordered by product priority; PORT-018 optional.

Use this document as the single source of truth for “what we decided to bring from A into B” and track each PORT-xxx as one issue/ticket in your project management tool.
