# Lendly Repo A vs Repo B — Comparative Integration Report

**Rule:** Repo B (CTO infrastructure) is the **foundation and source of truth**. This report identifies what is valuable in Repo A to integrate **on top of** Repo B. No blind merge.

---

### Repo roots and concise trees

| Repo | Path |
|------|------|
| **Repo A (old MVP)** | `c:\Users\User\Lendly MVP\` |
| **Repo B (CTO / foundation)** | `c:\Users\User\Lendly WEB\Landly-web\` |

**Repo A tree (concise):**
```
Lendly MVP/
├── apps/
│   ├── mobile/          # Expo app: app/(auth), app/(tabs), src/components, src/store
│   └── server/          # Next.js 14 API: src/app/api/*, prisma (PostgreSQL)
├── packages/
│   └── shared/         # Zod schemas, constants, utils, i18n
├── lendly/             # Standalone Next.js 16 web app (separate codebase)
│   ├── app/
│   │   ├── [locale]/   # admin, auth, bookings, category, dashboard, help, listing, listings, messages, profile, search, etc.
│   │   └── api/        # admin/*, auth/*, cron/*, dashboard/*, messages/*
│   ├── components/     # listing wizard steps, modals, nav, etc.
│   ├── lib/            # actions (admin, listings), auth, db
│   └── prisma/         # schema (SQLite): User, Listing, Booking, Dispute, Checklist, Thread, Message, Review, etc.
├── package.json        # workspaces, turbo
└── turbo.json
```

**Repo B tree (concise):**
```
Landly-web/
├── app/
│   ├── (main)/         # add, admin/kyc, bookings, checkout, home, listing/[id], profile, profile/kyc, search
│   ├── api/            # admin/kyc/*, bookings/*, checkout/*, kyc/*, listings/*, me, payments/*
│   ├── layout.tsx, page.tsx
│   └── globals.css
├── components/         # ui/*, admin-kyc-review, booking-card, kyc-flow, listing-card, listings-map, etc.
├── lib/                # admin.ts, prisma.ts, utils.ts
├── prisma/             # schema (SQLite): User (KYC), Listing, Booking, ListingImage, KYCAuditLog
└── public/
```

---

## 1. Repo A Summary

**Path:** `c:\Users\User\Lendly MVP`

Repo A is **two distinct codebases** under one folder:

### 1.1 Turborepo (apps + packages)

| Aspect | Details |
|--------|---------|
| **Root** | `c:\Users\User\Lendly MVP\` — `package.json`, `turbo.json`, workspaces: `apps/*`, `packages/*` |
| **Framework** | Next.js 14 (apps/server), Expo (apps/mobile) |
| **Backend** | `apps/server` — Next.js 14 App Router API, Prisma, **PostgreSQL** |
| **Routing (server)** | `apps/server/src/app/api/*` — auth, bookings, categories, items, payments, risk, safety, test |
| **Mobile** | `apps/mobile` — Expo, Expo Router, `app/(auth)`, `app/(tabs)` (browse, bookings, messages, profile) |
| **Shared** | `packages/shared` — TypeScript, Zod schemas, constants, utils (deposit/pricing), i18n (Hebrew) |
| **Database** | PostgreSQL, Prisma schema: User, Item, Booking, Message, Review, Verification, CategoryRequest |
| **Auth** | JWT (access + refresh), bcrypt, `apps/server/src/lib/auth.ts`, middleware in server |
| **Payments** | Manual confirmation only: `api/payments/manual/confirm` |
| **Storage** | Not explicitly present in scanned paths (items use `images String[]`) |
| **State (mobile)** | Zustand, React Query |
| **Styling (mobile)** | nativewind (Tailwind for RN) |
| **Domain coverage (server)** | Auth (login/register/refresh), items CRUD, bookings CRUD + pricing, categories + request, risk/deposit API, safety report-issue, manual payment confirm |

**Key server API paths:**  
`apps/server/src/app/api/auth/{login,register,refresh}/route.ts`, `apps/server/src/app/api/bookings/route.ts`, `apps/server/src/app/api/items/route.ts`, `apps/server/src/app/api/risk/deposit/route.ts`, `apps/server/src/lib/prisma.ts`, `apps/server/prisma/schema.prisma`

**Shared package paths:**  
`packages/shared/src/schemas.ts`, `packages/shared/src/constants.ts`, `packages/shared/src/utils.ts` (calculateDeposit, calculatePricing, formatCurrency, formatDate, etc.), `packages/shared/src/i18n.ts`

### 1.2 Lendly Web App (standalone Next.js inside Repo A)

**Path:** `c:\Users\User\Lendly MVP\lendly\`

| Aspect | Details |
|--------|---------|
| **Framework** | Next.js 16, React 19, next-intl (i18n), next-auth (Auth.js) |
| **Routing** | `app/[locale]/*` — admin, auth, bookings, category, dashboard, help, listing/listings, messages, profile, search, etc. |
| **API** | `app/api/admin/*`, `app/api/auth/*`, `app/api/cron/*`, `app/api/dashboard/*`, `app/api/messages/*` |
| **Database** | **SQLite**, Prisma — separate schema from apps/server |
| **Auth** | NextAuth (Account, Session), magic link, Google, dev-signin |
| **Admin** | Full panel: disputes (status update), listings (approve/pause/reject), users (ban/trust/verify), metrics, rules; `api/admin/*` + `[locale]/admin/*` pages |
| **Domain coverage** | Listing wizard (4 steps: basic info, photos, pricing, availability), listing approval workflow, booking list/detail, disputes (model + status API), checklists (Prisma: ChecklistPhase PICKUP/RETURN), dashboard owner/renter, messages/threads, cron expire-bookings, help/FAQ/safety, insurance terms, report-issue, RTL Hebrew |

**Schema (lendly/prisma/schema.prisma):**  
User, Account, Session, Listing (status PENDING/APPROVED/REJECTED/PAUSED), Booking (status incl. DISPUTED), Thread, Message, Review, **Dispute** (DisputeType, DisputeStatus), **Checklist** (phase PICKUP/RETURN, photos, conditionNotes, signedAt), AdminSettings, Rules, AuditLog.

**Notable files:**  
- Listing creation: `lendly/app/[locale]/listings/new/page.tsx` (4-step wizard: ListItemStepBasicInfo, ListItemStepPhotos, ListItemStepPricing, ListItemStepAvailability)  
- Admin: `lendly/lib/actions/admin.ts` (getAdminMetrics, getAdminListings, updateDisputeStatus, etc.), `lendly/app/api/admin/disputes/[id]/status/route.ts`, `lendly/app/api/admin/listings/[id]/{approve,pause,reject}/route.ts`, `lendly/app/api/admin/users/[id]/{ban,trust,verify}/route.ts`  
- Pages: `[locale]/admin/disputes`, `[locale]/admin/listings`, `[locale]/admin/users`, `[locale]/admin/metrics`, `[locale]/bookings/[id]`, `[locale]/dashboard`, `[locale]/messages`, `[locale]/search`, `[locale]/help/faq`, `[locale]/help/safety`

---

## 2. Repo B Summary

**Path:** `c:\Users\User\Lendly WEB\Landly-web\`  
**Source of truth:** https://github.com/TomerGer/Landly-web

| Aspect | Details |
|--------|---------|
| **Framework** | Next.js 16.1, React 19, single app (no monorepo) |
| **Routing** | `app/(main)/*` — add, admin/kyc, bookings (list, [id], pickup, return), checkout, home, listing/[id], profile, profile/kyc, search |
| **API** | `app/api/admin/kyc/*`, `app/api/bookings/*`, `app/api/checkout/summary`, `app/api/kyc/*`, `app/api/listings/*`, `app/api/me`, `app/api/payments/create-intent`, `app/api/payments/confirm` |
| **Database** | **SQLite**, Prisma 7.x, `@prisma/adapter-better-sqlite3` |
| **Auth** | Dev bypass only: `DEV_AUTH_BYPASS`, `lib/admin.ts` getCurrentUser; no NextAuth/Stripe yet in codebase |
| **Payments** | Mock payment intent + confirm: `api/payments/create-intent`, `api/payments/confirm` (placeholder for future Stripe) |
| **Storage** | KYC uploads (api/kyc/upload) — writes under `public/` |
| **Admin** | KYC only: admin/kyc (queue), admin/kyc/[userId], admin/kyc/audit |
| **State** | Client fetch + local state (no global store in scanned files) |
| **Styling** | Tailwind 4, Radix (Slot), CVA, shadcn-style components in `components/ui/` |
| **Domain coverage** | KYC (submit, upload, admin review, audit log), listings (search, detail), listing creation **placeholder** (add page = "הוספה"), bookings (create with KYC gate, list, detail, pickup/return **placeholder pages**), checkout (summary + mock payment), profile + profile/kyc, map (listings-map), Hebrew RTL |

**Schema (Landly-web/prisma/schema.prisma):**  
User (name, kycStatus, kycSelfieUrl, kycIdUrl, kycSubmittedAt, kycRejectedReason, isAdmin), Listing, Booking (rentalSubtotal, depositAmount, paymentIntentId, paymentStatus), ListingImage, KYCAuditLog. Enums: BookingStatus (REQUESTED, CONFIRMED, ACTIVE, COMPLETED, DISPUTE), PaymentStatus, KYCStatus. **No Dispute model, no Checklist model.**

**Notable files:**  
- KYC: `components/kyc-flow.tsx`, `components/selfie-capture.tsx`, `components/id-capture.tsx`, `app/api/kyc/submit/route.ts`, `app/api/kyc/upload/route.ts`, `app/api/admin/kyc/route.ts`, `app/api/admin/kyc/[userId]/route.ts`, `app/api/admin/kyc/audit/route.ts`  
- Bookings: `app/(main)/bookings/page.tsx`, `app/(main)/bookings/[id]/page.tsx`, `app/(main)/bookings/[id]/pickup/page.tsx` (UI only, no persistence), `app/(main)/bookings/[id]/return/page.tsx` (single line re dispute), `app/api/bookings/create/route.ts` (KYC check, creates REQUESTED), `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`  
- Checkout: `app/(main)/checkout/page.tsx`, `app/api/checkout/summary/route.ts`, `app/api/payments/create-intent/route.ts`, `app/api/payments/confirm/route.ts`  
- Listings: `app/(main)/listing/[id]/page.tsx`, `app/(main)/search/page.tsx`, `app/(main)/add/page.tsx` (placeholder), `app/api/listings/route.ts`, `app/api/listings/search/route.ts`, `app/api/listings/[id]/route.ts`  
- Admin: `app/(main)/admin/kyc/page.tsx`, `components/admin-kyc-review.tsx`, `lib/admin.ts` (requireAdmin, getCurrentUser)

---

## 3. Feature Comparison Matrix

| Feature / Module | Repo A status | Repo B status | Better source | Recommendation | Notes / risks | Relevant paths |
|-----------------|---------------|---------------|---------------|----------------|---------------|----------------|
| **Auth** | Turborepo: JWT (server). Lendly web: NextAuth, magic link, Google, dev-signin | Dev bypass only | Mixed | Keep B foundation; port A’s NextAuth/session pattern into B when adding real auth | B has no production auth yet. A’s lendly has NextAuth + adapters. | A: `lendly/app/api/auth/*`, `lendly/lib/auth`. B: `lib/admin.ts`, env DEV_AUTH_BYPASS |
| **KYC** | Not in Turborepo; not in lendly schema (different focus) | Full flow: submit, upload, admin review, audit | **B** | Keep B only | B is the only KYC implementation. | B: `app/api/kyc/*`, `app/api/admin/kyc/*`, `components/kyc-flow.tsx`, `components/selfie-capture.tsx`, `components/id-capture.tsx` |
| **Listing creation** | A (lendly): 4-step wizard (basic info, photos, pricing, availability), deposit override, blocked dates | B: add page placeholder ("הוספה") | **A** | Rebuild in B using A as reference | A has full UX and steps; B schema differs (Listing vs Item). Port flow and UI, adapt to B’s Listing/API. | A: `lendly/app/[locale]/listings/new/page.tsx`, `lendly/components/list-item-step-*.tsx`. B: `app/(main)/add/page.tsx` |
| **Listing approval** | A (lendly): PENDING/APPROVED/REJECTED/PAUSED, API approve/pause/reject | B: No listing approval workflow | **A** | Port into B (adapt to B schema) | Add status to B’s Listing if missing; add admin APIs and UI. | A: `lendly/app/api/admin/listings/[id]/{approve,pause,reject}/route.ts`, `lendly/lib/actions/admin.ts` (getAdminListings, etc.) |
| **Listing images** | A: Item.images String[]; lendly: Listing.photos (JSON). Photo upload step in wizard | B: ListingImage model, listing detail carousel | **B** for model; **A** for wizard UX | Keep B’s ListingImage; reuse A’s photo step UX in add flow | B already has normalized images. | A: `lendly/components/list-item-step-photos.tsx`, `lendly/components/photo-upload.tsx`. B: `prisma/schema.prisma` (ListingImage), `components/listing-image-carousel.tsx` |
| **Availability / blocked dates** | A (lendly): Listing.availability (JSON), step ListItemStepAvailability, blocked dates in wizard | B: Not in schema | **A** | Rebuild in B using A as reference | Add availability/blocked-dates to B’s Listing or separate table; port UI from A. | A: `lendly/components/list-item-step-availability.tsx`, `lendly/prisma/schema.prisma` (Listing.availability) |
| **Search** | A (lendly): [locale]/search, filters (e.g. insurance) | B: (main)/search, search-client, API listings/search | **Mixed** | Keep B’s API; consider A’s filter UX (e.g. insurance) if B adds insurance | B has search API. A has richer filter UI. | A: `lendly/app/[locale]/search/page.tsx`. B: `app/(main)/search/page.tsx`, `app/(main)/search/search-client.tsx`, `app/api/listings/search/route.ts` |
| **Map view** | A (lendly): listing map in category/search flows | B: listings-map, @vis.gl/react-google-maps, markerclusterer | **B** | Keep B only | B has map component. | B: `components/listings-map.tsx` |
| **Booking flow** | A Turborepo: full API (create with pricing, conflict check, deposit/insurance); A lendly: bookings list/detail | B: create (KYC-gated), list, detail, checkout summary, mock payment | **Mixed** | Keep B’s create + KYC gate; port A’s pricing/conflict logic if B adopts dynamic deposit/insurance | B has KYC gate; A server has availability conflict and pricing. | A: `apps/server/src/app/api/bookings/route.ts`, `packages/shared/src/utils.ts` (calculatePricing). B: `app/api/bookings/create/route.ts`, `app/(main)/checkout/page.tsx` |
| **Booking statuses** | A: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED; Turborepo Item; lendly Booking | B: REQUESTED, CONFIRMED, ACTIVE, COMPLETED, DISPUTE | **B** | Keep B enum; align naming with product (e.g. REQUESTED vs PENDING) | Minor semantic difference; keep B as source of truth. | A: `apps/server/prisma/schema.prisma`, `lendly/prisma/schema.prisma`. B: `prisma/schema.prisma` |
| **Pickup checklist** | A (lendly): Checklist model (phase PICKUP), backend support | B: (main)/bookings/[id]/pickup — UI only, no persistence | **A** | Rebuild in B using A as reference | Add Checklist (or equivalent) in B; port A’s checklist UX and persistence. | A: `lendly/prisma/schema.prisma` (Checklist), pickup flow. B: `app/(main)/bookings/[id]/pickup/page.tsx` |
| **Return checklist** | A (lendly): Checklist phase RETURN, condition/sign | B: return page — one line about dispute | **A** | Rebuild in B using A as reference | Same as pickup: add model + API, then UI. | A: `lendly/prisma/schema.prisma` (Checklist). B: `app/(main)/bookings/[id]/return/page.tsx` |
| **Disputes** | A (lendly): Dispute model, status API, admin disputes page | B: BookingStatus.DISPUTE only, no Dispute entity | **A** | Port into B (model + API + admin UI) | Add Dispute (or equivalent) in B; port admin dispute resolution. | A: `lendly/prisma/schema.prisma` (Dispute), `lendly/app/api/admin/disputes/[id]/status/route.ts`, `lendly/lib/actions/admin.ts`, `lendly/app/[locale]/admin/disputes/page.tsx` |
| **Non-return flow** | A (lendly): Dispute + statuses (e.g. RESOLVED_OWNER/RENTER, REFUND_PARTIAL) | B: Not implemented | **A** | Rebuild in B using A as reference | After Dispute is in B, add resolution outcomes. | A: `lendly/prisma/schema.prisma` (DisputeStatus) |
| **Payments / deposits** | A Turborepo: manual confirm, risk/deposit API, calculatePricing (insurance) | B: Mock create-intent + confirm, checkout summary with deposit | **Mixed** | Keep B’s flow; port A’s deposit/insurance logic (utils, risk API) when adding real payments | B is placeholder; A has real logic for deposit and optional insurance. | A: `apps/server/src/app/api/risk/deposit/route.ts`, `apps/server/src/app/api/payments/manual/confirm/route.ts`, `packages/shared/src/utils.ts`. B: `app/api/payments/create-intent/route.ts`, `app/api/payments/confirm/route.ts`, `app/api/checkout/summary/route.ts` |
| **Admin – bookings** | A (lendly): in dashboard/metrics, not separate admin bookings CRUD | B: None | **A** | Optional: port admin booking visibility from A if needed | Low priority. | A: `lendly/lib/actions/admin.ts` (getAdminMetrics uses bookings) |
| **Admin – disputes** | A (lendly): full (list + status update) | B: None | **A** | Port into B with Dispute model | Depends on adding Dispute. | A: `lendly/app/[locale]/admin/disputes/page.tsx`, `lendly/app/api/admin/disputes/[id]/status/route.ts` |
| **Audit logs** | A (lendly): AuditLog model; B: KYCAuditLog only | B: KYC-only audit | **Mixed** | Keep B’s KYCAuditLog; add general AuditLog (or extend) if needed for disputes/admin | A has generic AuditLog; B has KYC-specific. | A: `lendly/prisma/schema.prisma` (AuditLog). B: `prisma/schema.prisma` (KYCAuditLog) |
| **User suspension / ban** | A (lendly): admin users [id] ban API | B: None | **A** | Port into B when admin users exist | Add User.ban or equivalent and admin API. | A: `lendly/app/api/admin/users/[id]/ban/route.ts` |
| **Analytics / metrics** | A (lendly): admin metrics (listings, disputes, GMV, conversion) | B: None | **A** | Rebuild in B using A as reference | Port metrics logic and admin dashboard. | A: `lendly/app/api/admin/metrics/route.ts`, `lendly/lib/actions/admin.ts` (getAdminMetrics), `lendly/app/[locale]/admin/metrics/page.tsx` |
| **Chat / messages** | A Turborepo: Message model, booking-scoped; A lendly: Thread + Message, api/messages/threads | B: None | **A** | Rebuild in B using A as reference | Add Thread/Message (or equivalent) and APIs; port UI. | A: `lendly/prisma/schema.prisma` (Thread, Message), `lendly/app/api/messages/threads/route.ts`, `lendly/app/[locale]/messages/page.tsx` |
| **Reviews** | A: Turborepo Review (item); lendly Review (listing, fromUser/toUser) | B: Not in schema | **A** | Rebuild in B using A as reference | Add Review model and UI when product requires. | A: `apps/server/prisma/schema.prisma`, `lendly/prisma/schema.prisma` (Review) |
| **Admin – rules/settings** | A (lendly): Rules model, AdminSettings, api/admin/rules | B: None | **A** | Optional: port if B needs configurable rules (deposit %, etc.) | Useful for deposit/insurance rules. | A: `lendly/prisma/schema.prisma` (Rules, AdminSettings), `lendly/app/api/admin/rules/route.ts` |
| **Cron / expire bookings** | A (lendly): api/cron/expire-bookings | B: None | **A** | Port into B when booking lifecycle is final | Prevents stale REQUESTED bookings. | A: `lendly/app/api/cron/expire-bookings/route.ts` |
| **i18n / RTL** | A: packages/shared i18n (Hebrew), lendly next-intl [locale] | B: Hebrew in UI, no next-intl | **A** for structure | Reuse A’s copy/keys; consider next-intl in B later | A has centralized Hebrew and locale routing. | A: `packages/shared/src/i18n.ts`, `lendly` next-intl usage |
| **Design system / UI** | A (lendly): Radix, CVA, Tailwind, many components | B: Tailwind 4, Radix Slot, CVA, components/ui | **B** | Keep B; reuse A’s layout/copy only where useful | Avoid mixing two design systems. | B: `components/ui/*`, `components/*.tsx` |
| **Deposit calculation** | A: packages/shared utils (risk-based), constants (DEPOSIT_CONFIG, RISK_CATEGORIES) | B: Listing.deposit static, checkout summary | **A** | Port logic into B (utils/constants) when adding dynamic deposit | A has production-ready risk/deposit logic. | A: `packages/shared/src/utils.ts`, `packages/shared/src/constants.ts` |
| **Insurance** | A: optional insurance (basic/premium), in pricing and constants | B: Not in schema or checkout | **A** | Rebuild in B using A as reference when adding insurance | Add to Listing/Booking and checkout if product wants it. | A: `packages/shared/src/constants.ts` (INSURANCE_TYPES), `packages/shared/src/utils.ts` (calculatePricing) |
| **Category structure** | A: packages/shared CATEGORIES tree (Hebrew) | B: Listing.category string | **A** | Reuse as reference for categories/subcategories in B | Improves discovery and filters. | A: `packages/shared/src/constants.ts` (CATEGORIES) |
| **Help / FAQ / safety** | A (lendly): help, help/faq, help/safety, insurance-terms | B: None | **A** | Port copy and structure into B (static or CMS) | Low risk, high value for trust. | A: `lendly/app/[locale]/help/page.tsx`, `lendly/app/[locale]/help/faq/page.tsx`, `lendly/app/[locale]/help/safety/page.tsx`, `lendly/app/[locale]/insurance-terms/page.tsx` |
| **Report issue** | A: Turborepo api/safety/report-issue; lendly report-issue page | B: None | **A** | Rebuild in B using A as reference | Safety/trust feature. | A: `apps/server/src/app/api/safety/report-issue/route.ts`, `lendly/app/[locale]/report-issue/page.tsx` |

---

## 4. What Repo A Has That Repo B Should Reuse

### 4.1 PORT DIRECTLY (copy or minimal adaptation)

- **Hebrew copy and FAQ/safety content** — Use A’s help/FAQ/safety/insurance-terms text and structure in B’s static or help pages.  
  Paths: `lendly/app/[locale]/help/faq/page.tsx`, `lendly/app/[locale]/help/safety/page.tsx`, `packages/shared/src/i18n.ts`, `packages/shared/src/constants.ts` (BOOKING_STATUS_LABELS, etc.).
- **Category tree (Hebrew)** — `packages/shared/src/constants.ts` CATEGORIES: use as reference for B’s category/subcategory options.
- **Deposit/insurance constants and formulas** — `packages/shared/src/constants.ts` (DEPOSIT_CONFIG, RISK_CATEGORIES, INSURANCE_TYPES), `packages/shared/src/utils.ts` (calculateDeposit, calculatePricing): port into B’s lib (e.g. `lib/pricing.ts` or `lib/deposit.ts`) when B implements dynamic deposit/insurance; keep B’s API surface.

### 4.2 REBUILD IN B USING A AS REFERENCE

- **Listing creation wizard** — A’s 4-step flow (basic info, photos, pricing, availability) and components: rebuild in B under `(main)/add/`, using B’s Listing + ListingImage and API; reuse step order, validation ideas, and UX patterns from A.  
  Paths: `lendly/app/[locale]/listings/new/page.tsx`, `lendly/components/list-item-step-*.tsx`, `lendly/components/photo-upload.tsx`.
- **Listing approval workflow** — Add listing status (if not present) and admin APIs (approve/pause/reject) + admin UI; use A’s API and `lib/actions/admin.ts` as reference.  
  Paths: `lendly/app/api/admin/listings/[id]/{approve,pause,reject}/route.ts`, `lendly/lib/actions/admin.ts`.
- **Availability / blocked dates** — Add to B’s Listing (or related table) and add UI; use A’s `ListItemStepAvailability` and schema as reference.  
  Path: `lendly/components/list-item-step-availability.tsx`, `lendly/prisma/schema.prisma` (Listing.availability).
- **Disputes** — Add Dispute model (and status enum) in B; add admin dispute list + status update API and page; use A’s schema and admin flows as reference.  
  Paths: `lendly/prisma/schema.prisma` (Dispute, DisputeStatus), `lendly/app/api/admin/disputes/[id]/status/route.ts`, `lendly/app/[locale]/admin/disputes/page.tsx`, `lendly/lib/actions/admin.ts`.
- **Pickup/return checklists** — Add Checklist (or equivalent) model in B; add APIs and rebuild pickup/return pages with persistence and UX from A.  
  Paths: `lendly/prisma/schema.prisma` (Checklist, ChecklistPhase), `lendly/app/[locale]/bookings/[id]` flow; B: `app/(main)/bookings/[id]/pickup/page.tsx`, `app/(main)/bookings/[id]/return/page.tsx`.
- **Admin metrics dashboard** — GMV, conversion, listings/disputes counts; rebuild in B using A’s getAdminMetrics and metrics page.  
  Paths: `lendly/lib/actions/admin.ts` (getAdminMetrics), `lendly/app/[locale]/admin/metrics/page.tsx`, `lendly/app/api/admin/metrics/route.ts`.
- **Admin users (ban/trust/verify)** — When B has admin user management, add ban (and optionally trust/verify) using A’s APIs as reference.  
  Paths: `lendly/app/api/admin/users/[id]/{ban,trust,verify}/route.ts`.
- **Messages/chat** — Add Thread + Message (or equivalent) and APIs; rebuild messages UI using A’s threads API and pages.  
  Paths: `lendly/prisma/schema.prisma` (Thread, Message), `lendly/app/api/messages/threads/route.ts`, `lendly/app/[locale]/messages/page.tsx`.
- **Reviews** — Add Review model and listing/user review UI when needed; use A’s schema and any review UI as reference.  
  Paths: `lendly/prisma/schema.prisma` (Review), Turborepo `apps/server/prisma/schema.prisma`.
- **Cron: expire bookings** — Replicate logic in B (e.g. Vercel cron or external job) when booking lifecycle is defined.  
  Path: `lendly/app/api/cron/expire-bookings/route.ts`.
- **Report issue** — Add report-issue page and API in B; use A’s safety report-issue API and page as reference.  
  Paths: `apps/server/src/app/api/safety/report-issue/route.ts`, `lendly/app/[locale]/report-issue/page.tsx`.
- **Optional: Admin rules/settings** — If B needs configurable deposit/insurance rules, add Rules/AdminSettings (or equivalent) and API; use A’s schema and api/admin/rules as reference.  
  Paths: `lendly/prisma/schema.prisma` (Rules, AdminSettings), `lendly/app/api/admin/rules/route.ts`.

---

## 5. What Repo A Has That Repo B Should NOT Reuse

- **Turborepo structure** — Do not merge the monorepo (apps/server, apps/mobile, packages) into B. B stays a single Next.js app. Take only logic (e.g. shared utils/schemas) and reimplement in B where needed.
- **A’s PostgreSQL schema and migrations** — Do not adopt A’s DB as-is. B keeps SQLite and its schema; add only new models/fields (e.g. Dispute, Checklist) designed for B.
- **A’s JWT auth (apps/server)** — B will adopt its own auth (e.g. Supabase/session or NextAuth). Use A’s session/NextAuth pattern from lendly only as a reference, not the Turborepo JWT.
- **A’s “Item” naming** — B uses “Listing”; keep B’s naming and API surface.
- **Duplicate Prisma schemas** — Do not merge `lendly/prisma/schema.prisma` or `apps/server/prisma/schema.prisma` into B. Use them only as reference for new entities (Dispute, Checklist, Review, etc.).
- **Lendly’s full design system** — Keep B’s Tailwind/Radix/ui components; reuse A’s layout/copy/flow ideas, not component code that would conflict with B’s styling.
- **Expo/mobile app** — Out of scope for “integrate into Repo B” (B is web). Mobile can later consume B’s API.

---

## 6. Recommended Integration Order

### Phase 0 — Foundation alignment

- **Freeze/understand in B:**  
  - Auth strategy (Supabase vs NextAuth vs other) and how it will plug into `getCurrentUser` / `requireAdmin`.  
  - Listing model: confirm fields (e.g. status, availability) before adding approval or availability.  
  - Booking lifecycle: status transitions and when to run “expire” logic.
- **Risks:** Adding A features before B’s auth is defined can require rework.  
- **No code from A** — decisions and docs only.

### Phase 1 — Safe ports (low risk, high value)

1. **Help/FAQ/safety/insurance-terms** — Static or simple pages in B; copy content from A. No schema or auth dependency.  
2. **Category list / constants** — Add Hebrew category (and optionally subcategory) constants in B; use in search/add listing.  
3. **Deposit/pricing utils** — Copy/adapt `calculateDeposit` and `calculatePricing` (and related constants) into B’s `lib/`; use when B implements dynamic deposit/insurance (no DB change required for utils).  
4. **Report-issue** — Add a simple report-issue page + API that writes to DB or email; reference A’s API and copy.

**Dependencies:** None on B’s core auth/booking.  
**Risks:** Low.  
**Approach:** New files in B; no modification of existing B APIs.

### Phase 2 — Product flow integrations

1. **Listing creation (add flow)** — Rebuild 4-step wizard in B (`(main)/add/`), using B’s Listing + ListingImage and existing or new listing API; use A’s steps and validation as reference.  
2. **Listing approval** — Add status to Listing (if missing), admin APIs (approve/pause/reject), and admin listings page.  
3. **Availability/blocked dates** — Extend Listing (or add table); add UI in add/listing flow; reference A’s availability step.  
4. **Admin metrics** — New admin metrics API and page (counts, GMV, conversion); reference A’s getAdminMetrics.  
5. **Pickup/return checklists** — Add Checklist model and APIs; rebuild pickup/return pages with persistence; reference A’s schema and UI.  
6. **Disputes** — Add Dispute model and status; admin disputes list + status update API and page.

**Dependencies:** Phase 0 auth and listing/booking model clarity; B’s admin layout.  
**Risks:** Medium (schema and API surface changes).  
**Approach:** New migrations and routes in B; reuse A only as reference.

### Phase 3 — Deeper / riskier integrations

1. **Payments** — When B integrates real payments (e.g. Stripe), port A’s deposit and insurance logic into B’s checkout and any risk/deposit API.  
2. **Auth** — Implement production auth in B; optionally use A’s NextAuth/session pattern from lendly as reference.  
3. **Messages/chat** — Thread + Message models, APIs, and UI; impacts booking detail and notifications.  
4. **Reviews** — Review model and UI; affects listing and profile.  
5. **User ban/trust/verify** — Extend User and admin user APIs.  
6. **Cron / expire bookings** — Implement when booking lifecycle and env (e.g. Vercel cron) are ready.  
7. **Audit log** — General AuditLog (or extend KYCAuditLog) for disputes and admin actions.

**Dependencies:** Phase 0–2; payments and auth are critical path.  
**Risks:** High (auth, payments, lifecycle).  
**Approach:** Small, incremental changes; test each in B’s stack.

---

## 7. Top Architectural Risks

1. **Two schemas in A** — Turborepo (PostgreSQL, Item/Booking/Message/Review) and lendly (SQLite, Listing/Booking/Dispute/Checklist). B must not merge either schema; only add new B-native models/fields inspired by A.  
2. **Auth gap in B** — B relies on `DEV_AUTH_BYPASS`. Adding features that depend on “current user” or “admin” without a real auth layer will require rework when auth is added.  
3. **Database** — B uses SQLite; A’s Turborepo uses PostgreSQL. Any ported logic (e.g. deposit, pricing) must stay DB-agnostic; schema design must suit SQLite (e.g. JSON columns where A uses relations).  
4. **Naming** — B uses “Listing” and “listing”; A uses “Item” in Turborepo and “Listing” in lendly. Keep B’s naming everywhere.  
5. **Payment intent** — B’s create-intent/confirm are mocks. When replacing with Stripe (or other), ensure deposit/insurance amounts and booking lifecycle stay consistent with A’s pricing logic.  
6. **Admin scope** — B admin is KYC-only today. Adding listing/dispute/user admin will require a clear admin layout and permission model aligned with B’s future auth.

---

## 8. Exact Files / Modules To Inspect Before Any Merge Work

### Repo A (Lendly MVP)

- **Turborepo – shared logic**  
  - `packages/shared/src/schemas.ts` — Zod schemas for booking, item, auth.  
  - `packages/shared/src/constants.ts` — CATEGORIES, DEPOSIT_CONFIG, INSURANCE_TYPES, BOOKING_STATUS_LABELS, API_ENDPOINTS.  
  - `packages/shared/src/utils.ts` — calculateDeposit, calculatePricing, formatCurrency, formatDate.  
  - `packages/shared/src/i18n.ts` — Hebrew strings.
- **Turborepo – server API**  
  - `apps/server/src/app/api/bookings/route.ts` — create booking, conflict check, pricing.  
  - `apps/server/src/app/api/risk/deposit/route.ts` — deposit quote.  
  - `apps/server/src/app/api/payments/manual/confirm/route.ts` — manual payment confirm.  
  - `apps/server/prisma/schema.prisma` — Item, Booking, User, Message, Review.
- **Lendly web – schema and admin**  
  - `lendly/prisma/schema.prisma` — Listing, Booking, Dispute, Checklist, Thread, Message, Review, Rules, AuditLog.  
  - `lendly/lib/actions/admin.ts` — getAdminMetrics, getAdminListings, updateDisputeStatus, user ban/trust/verify.  
  - `lendly/app/api/admin/disputes/[id]/status/route.ts`.  
  - `lendly/app/api/admin/listings/[id]/{approve,pause,reject}/route.ts`.  
  - `lendly/app/api/admin/users/[id]/{ban,trust,verify}/route.ts`.  
  - `lendly/app/api/admin/metrics/route.ts`.  
  - `lendly/app/api/cron/expire-bookings/route.ts`.
- **Lendly web – listing wizard**  
  - `lendly/app/[locale]/listings/new/page.tsx`.  
  - `lendly/components/list-item-step-basic-info.tsx`, `list-item-step-photos.tsx`, `list-item-step-pricing.tsx`, `list-item-step-availability.tsx`.  
  - `lendly/components/photo-upload.tsx`.
- **Lendly web – pages**  
  - `lendly/app/[locale]/admin/disputes/page.tsx`, `admin/listings/page.tsx`, `admin/metrics/page.tsx`, `admin/users/page.tsx`.  
  - `lendly/app/[locale]/bookings/[id]/page.tsx`.  
  - `lendly/app/[locale]/help/faq/page.tsx`, `help/safety/page.tsx`.  
  - `lendly/app/[locale]/report-issue/page.tsx`.  
  - `lendly/app/api/messages/threads/route.ts`.

### Repo B (Landly-web)

- **Schema and config**  
  - `prisma/schema.prisma` — User (KYC fields), Listing, Booking, ListingImage, KYCAuditLog.  
  - `lib/admin.ts` — getCurrentUser, requireAdmin.
- **KYC**  
  - `app/api/kyc/submit/route.ts`, `app/api/kyc/upload/route.ts`.  
  - `app/api/admin/kyc/route.ts`, `app/api/admin/kyc/[userId]/route.ts`, `app/api/admin/kyc/audit/route.ts`.  
  - `components/kyc-flow.tsx`, `components/selfie-capture.tsx`, `components/id-capture.tsx`.
- **Bookings and checkout**  
  - `app/api/bookings/create/route.ts` — KYC check, create REQUESTED.  
  - `app/(main)/bookings/[id]/page.tsx`, `app/(main)/bookings/[id]/pickup/page.tsx`, `app/(main)/bookings/[id]/return/page.tsx`.  
  - `app/(main)/checkout/page.tsx`, `app/api/checkout/summary/route.ts`.  
  - `app/api/payments/create-intent/route.ts`, `app/api/payments/confirm/route.ts`.
- **Listings**  
  - `app/(main)/add/page.tsx` — current placeholder.  
  - `app/api/listings/route.ts`, `app/api/listings/search/route.ts`, `app/api/listings/[id]/route.ts`.  
  - `app/(main)/listing/[id]/page.tsx`, `app/(main)/search/page.tsx`.

Before implementing any “port” or “rebuild using A as reference,” open the corresponding A and B files above to align types, validation, and UX with B’s architecture.
