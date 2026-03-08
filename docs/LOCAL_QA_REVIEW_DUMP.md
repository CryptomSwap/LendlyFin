# Local QA / Dev Testing — Context Dump for Implementation

Single audit file for designing and implementing a safe local QA/dev testing system. No code changes yet — analysis only.

---

## 1. Project overview

- **Package manager:** npm (package.json scripts; no lock file path specified in repo).
- **Framework/runtime:** Next.js 16.1.0, React 19.2.3, Node.
- **App structure summary:** Next.js App Router. Root `app/` with `(main)` route group; `app/api/` for API routes. Shared layout wraps content in `AppShell` (header + bottom nav). RTL Hebrew UI.
- **Auth stack:** NextAuth v4 with JWT strategy. Google OAuth only. Session stores `lendlyUserId` (Prisma User id). No DB session tables (Session/Account/VerificationToken not in Prisma). Optional dev bypass: `DEV_AUTH_BYPASS=true` + `DEV_USER_ID` (or impersonation cookie) use `lib/auth/dev-adapter.ts`; otherwise `lib/auth/session-adapter.ts`.
- **DB stack:** Prisma 7.x, SQLite (provider `"sqlite"` in schema; seed uses `file:./prisma/dev.db`). No `url` in schema — Prisma default or env.
- **Email stack:** Resend. `lib/email/send.ts` + `lib/email/client.ts`. Env: `RESEND_API_KEY`, optional `EMAIL_FROM`, `APP_BASE_URL`, `ADMIN_EMAIL`. Best-effort send; failures logged, never block flows.
- **Storage/upload stack:** Local filesystem. Listing images: `app/api/listings/upload/route.ts` → `public/uploads/listings/{uuid}.{ext}`. KYC: `app/api/kyc/upload/route.ts` → `public/uploads/kyc/{userId}/{type}.{ext}`. Comment in code: replace with S3/Cloudinary in production.
- **Admin implementation summary:** Role-based via `User.isAdmin` (Boolean). No separate Admin model. `requireAdmin()` in `lib/auth/session-adapter.ts` (and dev-adapter) checks `user.isAdmin`. Admin pages under `app/(main)/admin/`; API under `app/api/admin/`. Audit log: `AuditLog` model used for KYC, listing, user, dispute, override actions.
- **Local dev commands currently used:**
  - `npm run dev` — Next dev (localhost, webpack).
  - `npm run db:seed` — Prisma seed (full reset + seed).
  - `npm run db:seed-test-users` — Add only email-based test users (no wipe).
  - `npm run build` / `npm run start` — Production build/start.
  - `npm run lint` — ESLint.

---

## 2. Full relevant file tree

```
app/
  layout.tsx
  page.tsx                    # redirects to /home
  globals.css
  (main)/
    layout.tsx                # AppShell
    signin/page.tsx
    onboarding/page.tsx
    onboarding/onboarding-form.tsx
    home/page.tsx
    search/page.tsx
    search/search-client.tsx
    listing/[id]/page.tsx
    listing/[id]/manage/page.tsx
    listing/[id]/manage/manage-client.tsx
    add/page.tsx
    checkout/page.tsx
    bookings/page.tsx
    bookings/[id]/page.tsx
    bookings/[id]/pickup/page.tsx
    bookings/[id]/pickup/pickup-form.tsx
    bookings/[id]/return/page.tsx
    bookings/[id]/return/return-form.tsx
    bookings/[id]/messages/page.tsx
    bookings/[id]/messages/messages-view.tsx
    bookings/[id]/leave-review-form.tsx
    profile/page.tsx
    profile/kyc/page.tsx
    owner/page.tsx
    help/page.tsx
    help/faq/page.tsx
    help/getting-started/page.tsx
    help/safety/page.tsx
    help/insurance-terms/page.tsx
    admin/
      bookings/page.tsx
      bookings/[id]/page.tsx
      bookings/[id]/confirm-payment-form.tsx
      users/page.tsx
      users/[id]/page.tsx
      users/[id]/suspend-actions.tsx
      users/users-table.tsx
      listings/page.tsx
      disputes/page.tsx
      disputes/[id]/page.tsx
      disputes/[id]/resolve-form.tsx
      kyc/page.tsx
      metrics/page.tsx
  api/
    auth/[...nextauth]/route.ts
    me/route.ts
    dev/status/route.ts
    dev/impersonate/route.ts
    profile/onboarding/route.ts
    kyc/submit/route.ts
    kyc/upload/route.ts
    listings/route.ts
    listings/search/route.ts
    listings/upload/route.ts
    listings/[id]/route.ts
    listings/[id]/availability/route.ts
    listings/[id]/blocked-ranges/route.ts
    listings/[id]/blocked-ranges/[rangeId]/route.ts
    listings/[id]/reviews/route.ts
    checkout/summary/route.ts
    payments/create-intent/route.ts
    payments/confirm/route.ts
    bookings/route.ts
    bookings/[id]/route.ts
    bookings/create/route.ts
    bookings/[id]/pickup-checklist/route.ts
    bookings/[id]/return-checklist/route.ts
    bookings/[id]/checklist-photos/route.ts
    bookings/[id]/messages/route.ts
    bookings/[id]/reviews/route.ts
    bookings/[id]/dispute/route.ts
    admin/
      users/route.ts
      users/[id]/route.ts
      users/[id]/suspend/route.ts
      users/[id]/unsuspend/route.ts
      listings/route.ts
      listings/[id]/route.ts
      bookings/route.ts
      bookings/[id]/route.ts
      bookings/[id]/confirm-payment/route.ts
      disputes/route.ts
      disputes/[id]/route.ts
      disputes/[id]/resolve/route.ts
      kyc/route.ts
      kyc/[userId]/route.ts
      kyc/audit/route.ts
      metrics/route.ts

components/
  app-shell.tsx
  session-provider.tsx
  sign-in-google-button.tsx
  sign-out-button.tsx
  auth-header-link.tsx
  dev-impersonation-switcher.tsx
  bottom-nav.tsx
  logo.tsx
  admin-nav.tsx
  listing-card.tsx
  listing-image-carousel.tsx
  listings-map.tsx
  search-input.tsx
  create-booking-cta.tsx
  booking-card.tsx
  trust-badges.tsx
  selfie-capture.tsx
  id-capture.tsx
  camera-capture.tsx
  kyc-flow.tsx
  admin-kyc-review.tsx
  home/TrustStrip.tsx
  home/HowItWorks.tsx
  listings/BlockDateRangeDialog.tsx
  listings/ListingAvailabilityCalendar.tsx
  listings/ListingAvailabilityLegend.tsx
  owner/OwnerAttentionList.tsx
  owner/OwnerListingsSection.tsx
  owner/OwnerUpcomingBookings.tsx
  owner/OwnerQuickActions.tsx
  owner/OwnerStatsCards.tsx
  owner/OwnerListingsOverview.tsx
  owner/StatusTabs.tsx
  bookings/BookingsListSection.tsx
  bookings/BookingStatusTabs.tsx
  reviews/ReviewCard.tsx
  ui/
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    alert.tsx
    chips.tsx
    accordion.tsx
    status-pill.tsx
    empty-state.tsx
    loading-block.tsx
    sticky-cta.tsx
    trust-cta-row.tsx
    faq-block.tsx
    listing-card-skeleton.tsx

lib/
  prisma.ts
  admin.ts                    # re-exports auth adapter (getCurrentUser, requireUser, requireAdmin, isAdminUser)
  utils.ts
  constants.ts
  audit.ts
  booking-auth.ts             # requireBookingAccess, requireBookingMessagesAccess, PICKUP/RETURN_PHOTO_ANGLES
  booking-ref.ts
  availability.ts
  pricing.ts
  status-labels.ts            # booking, listing, payment, deposit, dispute labels + pill variants
  auth/
    adapter.ts                # chooses dev vs session adapter by DEV_AUTH_BYPASS
    session-adapter.ts        # getCurrentUser via getServerSession(authOptions)
    dev-adapter.ts            # getCurrentUser via DEV_USER_ID / impersonation cookie + Prisma
    dev-impersonation.ts      # DEV_IMPERSONATION_ALLOWED_IDS, isAllowedDevImpersonationId, cookie name
    nextauth-options.ts       # authOptions, isOnboardingComplete, JWT/session callbacks
    onboarding.ts             # needsOnboarding(user)
    types.ts                  # AuthUser
  email/
    client.ts                 # getResendClient, getEmailFrom, getAppBaseUrl
    send.ts
    templates/
      booking-requested.ts
      booking-confirmed.ts
      booking-active.ts
      booking-completed.ts
      dispute-opened.ts
      dispute-resolved.ts
  notifications/booking-lifecycle.ts  # send*Emails for requested, confirmed, active, completed, dispute opened/resolved
  payments/
    adapter.ts                # createIntent, confirmManualPayment, releaseDeposit*, getPaymentSnapshot
    types.ts
  owner/dashboard.ts
  trust/badges.ts
  copy/help-reassurance.ts

prisma/
  schema.prisma
  seed.ts
  seed-test-users.ts

middleware.ts
package.json
next.config.ts
types/                        # (if any — not listed in glob results; may be inline or in lib)
docs/
  LOCAL_QA_WORKFLOW.md
  LOCAL_GOOGLE_AUTH.md
  DEBUG_GOOGLE_SIGNIN.md
  AUTH_ENTRY_AUDIT.md
```

---

## 3. Prisma schema audit

**File path:** `prisma/schema.prisma`

**Datasource:** `provider = "sqlite"` (no `url` in schema; seed uses `file:./prisma/dev.db`).

**Relevant models and enums (exact snippets):**

### User

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String?  @unique
  image     String?
  phoneNumber String?
  city      String?

  bookings  Booking[]
  listings  Listing[]
  messagesSent Message[]
  reviewsGiven   Review[]  @relation("ReviewAuthor")
  reviewsReceived Review[]  @relation("ReviewTarget")

  kycStatus         KYCStatus?  @default(PENDING)
  kycSelfieUrl      String?
  kycIdUrl          String?
  kycSubmittedAt    DateTime?
  kycRejectedReason String?
  isAdmin           Boolean     @default(false)

  suspendedAt       DateTime?
  suspensionReason  String?

  createdAt         DateTime    @default(now())
}
```

- Relations: Booking, Listing, Message (sender), Review (author/target).
- Unique: `email`.
- No Session/Account/VerificationToken (NextAuth JWT only).
- **Seeding/impersonation:** Fixed ids used in seed: `dev-user`, `admin-user`, `roythejewboy`, `qa-renter`, `qa-kyc-submitted`, `qa-kyc-rejected`. Email-based: `admin@lendly.test`, `lender@lendly.test`, `renter@lendly.test`. Dev adapter and impersonation allow only ids in `DEV_IMPERSONATION_ALLOWED_IDS`.

### Listing

```prisma
model Listing {
  id                  String        @id @default(cuid())
  ownerId             String?
  owner               User?         @relation(fields: [ownerId], references: [id], onDelete: SetNull)
  title               String
  description         String?
  pricePerDay         Int
  deposit             Int
  city                String
  category            String
  status              ListingStatus @default(PENDING_APPROVAL)
  statusRejectionReason String?
  valueEstimate       Int?
  pickupNote          String?
  rules               String?
  lat                 Float?
  lng                 Float?
  bookings            Booking[]
  images              ListingImage[]
  blockedRanges       ListingBlockedRange[]
  createdAt           DateTime      @default(now())
  @@index([ownerId])
}
```

### Booking

```prisma
model Booking {
  id         String   @id @default(cuid())
  bookingRef String?  @unique
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  listing    Listing  @relation(fields: [listingId], references: [id])
  listingId  String

  rentalSubtotal  Int @default(0)
  serviceFee      Int @default(0)
  depositAmount   Int @default(0)
  totalDue        Int @default(0)

  paymentIntentId String?
  paymentStatus   PaymentStatus   @default(PENDING)
  depositStatus   DepositStatus   @default(PENDING)

  paymentMethod            String?
  paymentLink              String?
  paymentConfirmedAt       DateTime?
  paymentConfirmedByAdminId String?
  paymentNotes             String?

  startDate DateTime
  endDate   DateTime

  status    BookingStatus

  pickupInstructionsSnapshot String?

  pickupChecklist   PickupChecklist?
  returnChecklist   ReturnChecklist?
  checklistPhotos   BookingChecklistPhoto[]
  dispute           Dispute?
  conversation      Conversation?
  reviews           Review[]

  createdAt DateTime @default(now())
}
```

- Unique: `bookingRef`. Relations: User, Listing, PickupChecklist, ReturnChecklist, BookingChecklistPhoto, Dispute, Conversation, Review.

### Review

```prisma
model Review {
  id           String   @id @default(cuid())
  bookingId    String
  booking      Booking  @relation(...)
  authorId     String
  author       User     @relation("ReviewAuthor", ...)
  targetUserId String
  targetUser   User     @relation("ReviewTarget", ...)
  rating       Int
  body         String?
  createdAt    DateTime @default(now())
  @@unique([bookingId, authorId])
  @@index([bookingId])
  @@index([targetUserId])
}
```

### Conversation / Message

```prisma
model Conversation {
  id         String    @id @default(cuid())
  bookingId String    @unique
  booking   Booking   @relation(...)
  messages  Message[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@index([bookingId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(...)
  senderId       String
  sender         User         @relation(...)
  body           String
  createdAt      DateTime     @default(now())
  @@index([conversationId])
  @@index([senderId])
}
```

### Dispute

```prisma
enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_OWNER
  RESOLVED_RENTER
  RESOLVED_SPLIT
  CLOSED
}

model Dispute {
  id               String        @id @default(cuid())
  bookingId        String        @unique
  booking          Booking       @relation(...)
  reason           String        // "damage" | "missing_items" | "manual"
  status           DisputeStatus @default(OPEN)
  openedByUserId   String?
  adminNote        String?
  resolutionNote   String?
  resolvedAt       DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  @@index([status])
  @@index([bookingId])
}
```

### KYC-related (on User)

- Fields on User: `kycStatus`, `kycSelfieUrl`, `kycIdUrl`, `kycSubmittedAt`, `kycRejectedReason`. Enum below.

### Admin-related

- `User.isAdmin`. `AuditLog` for audit trail:

```prisma
model AuditLog {
  id                String   @id @default(cuid())
  entityType        String   // "KYC" | "LISTING" | "USER" | "DISPUTE" | "OVERRIDE" | "BOOKING"
  entityId          String
  action            String
  adminUserId       String
  adminName         String
  reason            String?
  targetDisplayName String?
  createdAt         DateTime @default(now())
  @@index([entityType, entityId])
  @@index([entityType, createdAt])
  @@index([createdAt])
}
```

### Enums

```prisma
enum ListingStatus { DRAFT | PENDING_APPROVAL | ACTIVE | REJECTED | PAUSED }
enum BookingStatus { REQUESTED | CONFIRMED | ACTIVE | COMPLETED | DISPUTE }
enum PaymentStatus { PENDING | SUCCEEDED | FAILED | REFUNDED }
enum DepositStatus { PENDING | HELD | RELEASED_RENTER | RELEASED_OWNER | SPLIT }
enum KYCStatus { PENDING | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED }
```

### Other models (checklists, images)

- `PickupChecklist`, `ReturnChecklist`, `BookingChecklistPhoto`, `ListingImage`, `ListingBlockedRange` — as in schema; all referenced from Booking or Listing.

**Seeding / impersonation notes:** Seed creates users with fixed ids and optionally email-based users. Impersonation cookie and dev adapter only accept ids in `DEV_IMPERSONATION_ALLOWED_IDS`. Seed wipes bookings, listing images, listings, users in that order then creates users and listings and two bookings for `qa-renter`.

---

## 4. Auth system audit

### Sign-in flow

- User visits `/signin`. If already signed in (session), redirect to `callbackUrl` or `/profile`.
- Sign-in page uses Google button → NextAuth sign-in → callback creates/updates Prisma User by email and stores `lendlyUserId` in JWT.

### Provider(s)

- Google only. `GoogleProvider` in `lib/auth/nextauth-options.ts`; requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. If missing, providers array is empty and sign-in UI shows “not configured” message.

### JWT callback logic

**File:** `lib/auth/nextauth-options.ts`

- On sign-in (account + profile): find or create User by email; set `token.lendlyUserId = dbUser.id`, `token.onboardingComplete = isOnboardingComplete(dbUser)`.
- On subsequent requests: if `token.lendlyUserId` set, refresh `token.onboardingComplete` from DB (name, phoneNumber, city).

### Session callback logic

- `session.user.id = token.lendlyUserId ?? token.sub`; `session.onboardingComplete = token.onboardingComplete ?? false`.

### User creation/update logic

- In JWT callback: `prisma.user.findUnique({ where: { email } })`; if !dbUser then `prisma.user.create({ data: { email, name, image } })`; else `prisma.user.update` (name, image). Then token gets `dbUser.id`.

### Onboarding gate logic

- `isOnboardingComplete(u)`: name, phoneNumber, city all non-empty after trim. Exposed in session as `onboardingComplete`.
- `lib/auth/onboarding.ts`: `needsOnboarding(user)` = !hasName || !hasPhone || !hasCity.
- Middleware: if protected path and token present and !onboardingComplete, redirect to `/onboarding?callbackUrl=...`.

### Middleware redirect logic

**File:** `middleware.ts`

- Public paths: `/`, `/search`, `/help`, `/signin`, `/onboarding`, `/listing` (and `/listing/*` unless path includes `/manage`). No auth check.
- Protected paths: `/add`, `/bookings`, `/checkout`, `/profile`, any path containing `/manage`. If `DEV_AUTH_BYPASS=true`, next. Else if no NEXTAUTH_SECRET, next. Else getToken; if !token redirect to `/signin?callbackUrl=pathname`. If !onboardingComplete redirect to `/onboarding?callbackUrl=pathname`.
- Matcher: `["/((?!_next/static|_next/image|favicon.ico|uploads|api/).*)"]` — API routes not run through this middleware.

### How /api/me gets current user

**File:** `app/api/me/route.ts`

- Calls `getCurrentUser()` from `@/lib/admin` (which is `lib/auth/adapter.ts` → session or dev adapter). If !user returns 401. Then loads full user from Prisma with `ME_SELECT` and adds `completedBookingsCount`, `reviewsCount`, `averageRating`. Returns JSON; no session object exposed.

### Helper utilities

- `lib/auth/adapter.ts`: exports `getCurrentUser`, `requireUser`, `requireAdmin`, `isAdminUser` from either dev or session adapter.
- `lib/auth/session-adapter.ts`: `getCurrentUser` via `getServerSession(authOptions)` then Prisma by session.user.id; `toAuthUser(row)`; `requireUser` / `requireAdmin` return `{ user, error }`.
- `lib/auth/dev-adapter.ts`: when `DEV_AUTH_BYPASS=true`, `getCurrentUser` uses `DEV_USER_ID` or impersonation cookie; validates id via `isAllowedDevImpersonationId`; upserts User if missing so “current user” always exists in dev.
- `lib/auth/dev-impersonation.ts`: `DEV_IMPERSONATION_ALLOWED_IDS`, `DEV_IMPERSONATE_COOKIE_NAME`, `isAllowedDevImpersonationId(id)`.

### Admin: role-based vs email-based

- Admin is **role-based**: `User.isAdmin === true`. No email allowlist in code. Seed sets `isAdmin: true` for `admin-user` and `admin@lendly.test`.

### Relevant code locations

| What | File | Snippet / note |
|------|------|----------------|
| NextAuth config | `lib/auth/nextauth-options.ts` | `authOptions`: providers, session strategy JWT, callbacks (jwt, session, redirect), pages.signIn |
| Session helpers | `lib/auth/session-adapter.ts` | `getCurrentUser`, `requireUser`, `requireAdmin`, `isAdminUser` |
| Dev adapter | `lib/auth/dev-adapter.ts` | Same exports; uses env/cookie and Prisma upsert |
| Adapter choice | `lib/auth/adapter.ts` | `useDevAdapter = process.env.DEV_AUTH_BYPASS === "true"` |
| Middleware | `middleware.ts` | PUBLIC_PATHS, isProtectedPath, getToken, redirect to signin/onboarding |
| /api/me | `app/api/me/route.ts` | getCurrentUser(); Prisma findUnique + counts |
| Sign-in page | `app/(main)/signin/page.tsx` | getServerSession; redirect if session; SignInGoogleButton with callbackUrl |

---

## 5. Routing audit for pages we need to reach in QA

### Auth

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/signin` | `app/(main)/signin/page.tsx` | Google sign-in | No | — |
| `/onboarding` | `app/(main)/onboarding/page.tsx` | Name, phone, city | Yes | needsOnboarding → else redirect to profile |

### Onboarding

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/onboarding` | (above) | Complete profile | Yes | — |

### Search / browse

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/` | `app/page.tsx` | Redirect to /home | No | — |
| `/home` | `app/(main)/home/page.tsx` | Home landing | No (page may use getCurrentUser) | — |
| `/search` | `app/(main)/search/page.tsx` | Search listings | No | — |
| `/listing/[id]` | `app/(main)/listing/[id]/page.tsx` | Listing detail (no /manage) | Public read | Listing exists |

### Listing details, create/edit

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/listing/[id]` | (above) | View listing | No | — |
| `/listing/[id]/manage` | `app/(main)/listing/[id]/manage/page.tsx` | Manage availability | Yes, owner or admin | User is owner or isAdmin |
| `/add` | `app/(main)/add/page.tsx` | Create listing | Yes | — |

### Renter bookings

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/bookings` | `app/(main)/bookings/page.tsx` | My bookings list | Yes | — |
| `/bookings/[id]` | `app/(main)/bookings/[id]/page.tsx` | Booking detail | Yes, renter or admin | requireBookingAccess |
| `/bookings/[id]/pickup` | `app/(main)/bookings/[id]/pickup/page.tsx` | Pickup checklist | Yes, renter or admin | Booking CONFIRMED |
| `/bookings/[id]/return` | `app/(main)/bookings/[id]/return/page.tsx` | Return checklist | Yes, renter or admin | Booking ACTIVE, pickup done |
| `/bookings/[id]/messages` | `app/(main)/bookings/[id]/messages/page.tsx` | Messages | Yes, renter/owner/admin | requireBookingMessagesAccess |
| `/checkout` | `app/(main)/checkout/page.tsx` | Checkout (payment redirect) | Yes | Booking in REQUESTED, payment flow |

### Owner dashboard

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/owner` | `app/(main)/owner/page.tsx` | Owner dashboard | Yes | Listings/bookings for current user |

### Messaging

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/bookings/[id]/messages` | (above) | Conversation | Renter, owner, or admin | — |

### Reviews

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| Review submit | API `POST /api/bookings/[id]/reviews` + form on booking page | Leave review | Yes, participant | Booking COMPLETED, not already reviewed by this author |

### Admin — users, listings, bookings, disputes, metrics, KYC

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/admin/users` | `app/(main)/admin/users/page.tsx` | Users list | Admin | requireAdmin |
| `/admin/users/[id]` | `app/(main)/admin/users/[id]/page.tsx` | User detail, suspend/unsuspend | Admin | — |
| `/admin/listings` | `app/(main)/admin/listings/page.tsx` | Listings list | Admin | — |
| `/admin/listings` (API) | `app/api/admin/listings/route.ts` | List admin | Admin | — |
| `/admin/bookings` | `app/(main)/admin/bookings/page.tsx` | Bookings list | Admin | — |
| `/admin/bookings/[id]` | `app/(main)/admin/bookings/[id]/page.tsx` | Booking detail, confirm payment | Admin | — |
| `/admin/disputes` | `app/(main)/admin/disputes/page.tsx` | Disputes list | Admin | — |
| `/admin/disputes/[id]` | `app/(main)/admin/disputes/[id]/page.tsx` | Dispute detail, resolve | Admin | — |
| `/admin/metrics` | `app/(main)/admin/metrics/page.tsx` | Metrics | Admin | — |
| `/admin/kyc` | `app/(main)/admin/kyc/page.tsx` | KYC queue (SUBMITTED) | Admin | — |

### KYC (user-facing)

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `/profile/kyc` | `app/(main)/profile/kyc/page.tsx` | KYC flow (submit docs) | Yes | Redirect if already SUBMITTED/APPROVED/REJECTED |
| `/profile` | `app/(main)/profile/page.tsx` | Profile, link to KYC | Yes | — |

### Hidden / internal dev

| Route | Source | Purpose | Auth | Dependency |
|-------|--------|---------|------|-------------|
| `GET /api/dev/status` | `app/api/dev/status/route.ts` | Impersonation available + current user | No (but 404 if !DEV_AUTH_BYPASS) | DEV_AUTH_BYPASS=true |
| `POST /api/dev/impersonate` | `app/api/dev/impersonate/route.ts` | Set/clear impersonation cookie | No (404 if !DEV_AUTH_BYPASS) | Body: `{ userId: string \| null }`; userId must be in allowed list or empty |

---

## 6. Booking lifecycle implementation audit

**Lifecycle (target):**  
REQUESTED → (payment/Bit) → admin confirms payment → CONFIRMED → pickup checklist complete → ACTIVE → return checklist complete → COMPLETED (or DISPUTE → admin resolves → COMPLETED).

### Status enum

- **Location:** `prisma/schema.prisma` — `enum BookingStatus { REQUESTED | CONFIRMED | ACTIVE | COMPLETED | DISPUTE }`.
- **Labels:** `lib/status-labels.ts` — `BOOKING_STATUS_LABELS`, `getBookingStatusLabel`, `getBookingStatusPillVariant`.

### Transition logic (files)

| Transition | File | What happens |
|------------|------|--------------|
| Create booking | `app/api/bookings/create/route.ts` | Creates Booking with status REQUESTED, creates Conversation; sends `sendBookingRequestedEmails`. |
| Payment intent / Bit link | `lib/payments/adapter.ts` — `createIntent`, `startManualBitPayment` | Sets amounts, paymentMethod MANUAL_BIT, paymentLink from env; paymentStatus PENDING. |
| Admin confirm payment | `app/api/admin/bookings/[id]/confirm-payment/route.ts` | `requireAdmin` → `confirmManualPayment(bookingId)` → sets paymentStatus SUCCEEDED, depositStatus HELD, status CONFIRMED, paymentConfirmedAt, paymentConfirmedByAdminId; `createAuditLog`; `sendBookingConfirmedEmails`. |
| CONFIRMED → ACTIVE | `app/api/bookings/[id]/pickup-checklist/route.ts` (PUT) | When pickup checklist complete (accessoriesConfirmed, conditionConfirmed, all pickup photos), sets booking status ACTIVE; calls `sendBookingActiveEmails`. |
| ACTIVE → COMPLETED or DISPUTE | `app/api/bookings/[id]/return-checklist/route.ts` (PUT) | When return checklist complete: if no damage/missing → `releaseDepositToRenter(bookingId, { setBookingCompleted: true })`, status COMPLETED, `sendBookingCompletedEmails`. If damage/missing → status DISPUTE, create Dispute if not exists, `sendDisputeOpenedEmails`. |
| Open dispute (manual) | `app/api/bookings/[id]/dispute/route.ts` | Allowed for ACTIVE, COMPLETED, or DISPUTE; creates Dispute, sets booking status DISPUTE; `sendDisputeOpenedEmails`. |
| Resolve dispute | `app/api/admin/disputes/[id]/resolve/route.ts` | requireAdmin; body `resolution`: owner | renter | split; maps to DisputeStatus RESOLVED_*; calls `releaseDepositToOwner`, `releaseDepositToRenter`, or `splitDeposit` with `setBookingCompleted: true`; updates dispute; `createAuditLog`; `sendDisputeResolvedEmails`. |

### Admin confirmation route

- **Path:** `app/api/admin/bookings/[id]/confirm-payment/route.ts`
- **Method:** POST. Body optional: `{ paymentNotes?: string }`.
- **Logic:** requireAdmin → confirmManualPayment (payment adapter) → audit log → sendBookingConfirmedEmails.

### Checklist-related

- **Pickup:** `app/api/bookings/[id]/pickup-checklist/route.ts` — GET returns checklist + photos + isComplete; PUT upserts PickupChecklist, if complete sets booking ACTIVE and sends emails. Requires booking CONFIRMED.
- **Return:** `app/api/bookings/[id]/return-checklist/route.ts` — GET/PUT; PUT requires ACTIVE and pickup completed; on complete without issue: release deposit, COMPLETED, send emails; with issue: DISPUTE, create Dispute, send dispute emails.
- **Photos:** `app/api/bookings/[id]/checklist-photos/route.ts` — used to store pickup/return photos (angle: front, side, accessories). `lib/booking-auth.ts`: `PICKUP_PHOTO_ANGLES`, `RETURN_PHOTO_ANGLES`.

### Dispute entry

- **Entry:** `app/api/bookings/[id]/dispute/route.ts` — POST; reason: damage | missing_items | manual; creates Dispute, booking → DISPUTE.
- **Resolution:** `app/api/admin/disputes/[id]/resolve/route.ts` — POST; resolution owner/renter/split; updates dispute status and resolvedAt; deposit release; booking → COMPLETED; audit + emails.

### Email triggers (lifecycle)

- All in `lib/notifications/booking-lifecycle.ts`: `sendBookingRequestedEmails`, `sendBookingConfirmedEmails`, `sendBookingActiveEmails`, `sendBookingCompletedEmails`, `sendDisputeOpenedEmails`, `sendDisputeResolvedEmails`. Best-effort; do not block.

---

## 7. KYC implementation audit

### Fields / status location

- **Model:** User in `prisma/schema.prisma`: `kycStatus` (KYCStatus?), `kycSelfieUrl`, `kycIdUrl`, `kycSubmittedAt`, `kycRejectedReason`.
- **Enum:** `KYCStatus`: PENDING | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED.
- **Labels:** No central KYC label file in audit; status shown in profile/admin from DB.

### Approval / rejection flow

- **User submit:** `app/api/kyc/submit/route.ts` — POST body `{ selfieUrl, idUrl }`. Rejects if already SUBMITTED/APPROVED/REJECTED. Sets kycStatus SUBMITTED, stores URLs and kycSubmittedAt.
- **Admin approve/reject:** `app/api/admin/kyc/[userId]/route.ts` — POST body `{ action: "approve" | "reject", reason?: string }`. Updates user kycStatus to APPROVED or REJECTED; on reject can set kycRejectedReason. Writes `createAuditLog` entityType KYC.

### Pages/components using KYC state

- `app/(main)/profile/kyc/page.tsx` — Fetches /api/me; if kycStatus SUBMITTED/APPROVED/REJECTED redirects to profile; else renders KYCFlow.
- `app/(main)/profile/page.tsx` — Profile; link/state for KYC (not fully inspected; typically shows status and link to /profile/kyc).
- `components/kyc-flow.tsx` — KYC submission UI (selfie + ID upload).
- Admin: `app/(main)/admin/kyc/page.tsx` — KYC queue; uses `admin-kyc-review.tsx` and API GET `/api/admin/kyc`, POST `/api/admin/kyc/[userId]`.

### Restrictions by KYC state

- **Booking create:** `app/api/bookings/create/route.ts` — If `user.kycStatus !== "APPROVED"` returns 403 with Hebrew message (PENDING/IN_PROGRESS/SUBMITTED/REJECTED). Only APPROVED can create bookings.

### Admin review surface

- **List:** GET `app/api/admin/kyc/route.ts` — requireAdmin; returns users with kycStatus SUBMITTED.
- **Decision:** POST `app/api/admin/kyc/[userId]/route.ts` — approve/reject + optional reason; audit log.
- **Audit:** GET `app/api/admin/kyc/audit/route.ts` — requireAdmin; returns AuditLog rows entityType KYC.

### Seed implications

- Seed sets specific users with kycStatus: APPROVED (admin, lender, qa-renter, etc.), PENDING (renter), SUBMITTED (qa-kyc-submitted), REJECTED (qa-kyc-rejected). QA can test approval flow as SUBMITTED and booking block as non-APPROVED.

### Upload (KYC)

- **File:** `app/api/kyc/upload/route.ts` — POST multipart; file + type (selfie | id). Writes to `public/uploads/kyc/{user.id}/{type}.{ext}`. Returns URL path for use in submit.

---

## 8. Existing seed / dev tooling audit

### Prisma seed

- **Exists:** Yes. `package.json`: `"prisma": { "seed": "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }`.
- **Run:** `npm run db:seed` or `npx prisma db seed`.

### Current seed files

- **prisma/seed.ts:** Uses Prisma with `PrismaBetterSqlite3` and `file:./prisma/dev.db`. Deletes in order: Booking, ListingImage, Listing, User. Then creates: dev-user, admin-user, roythejewboy; email-based admin@, lender@, renter@; qa-renter, qa-kyc-submitted, qa-kyc-rejected. Creates 3 listings (Sony, tent, drill) with images (Unsplash URLs). Creates 2 bookings for qa-renter (ACTIVE, COMPLETED). No Prisma migrate/push inside seed — assumes DB exists.
- **prisma/seed-test-users.ts:** Only upserts the three email-based users (admin@, lender@, renter@). Script: `npm run db:seed-test-users`.

### Test/demo data generation

- Seed is the only structured test data. Listings use `approxCityCoords` and jitter; images are external URLs. No Faker/random names beyond fixed list.

### Mock users

- Fixed ids: dev-user, admin-user, roythejewboy, qa-renter, qa-kyc-submitted, qa-kyc-rejected. Email-based: admin@lendly.test, lender@lendly.test, renter@lendly.test. Dev adapter can upsert by id when DEV_AUTH_BYPASS and user missing.

### Dev-only routes

- GET `/api/dev/status` — returns impersonation available + current user (404 if !DEV_AUTH_BYPASS).
- POST `/api/dev/impersonate` — body `{ userId: string | null }`; sets or clears cookie `dev_impersonate_id`; allowed ids from `DEV_IMPERSONATION_ALLOWED_IDS` (404 if !DEV_AUTH_BYPASS).

### Admin shortcuts

- None beyond admin nav links. Confirm payment and dispute resolve are normal admin actions.

### Storybook / playground / internal tools

- None found. No storybook, no dedicated playground route.

### Local uploads/images

- **Listings:** `public/uploads/listings/{uuid}.{ext}`. Seed uses Unsplash URLs for ListingImage, so no local files required for seeded listings.
- **KYC:** `public/uploads/kyc/{userId}/{type}.{ext}`. For QA, KYC submit can use placeholder URLs or real uploads; upload route writes to public.

### package.json scripts (relevant)

- `dev`: `next dev -H localhost --webpack`
- `db:seed`: `npx prisma db seed`
- `db:seed-test-users`: `npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed-test-users.ts`
- `lint`: `eslint`
- No `db:push`, `db:migrate`, `db:reset`, or `typecheck` in provided package.json; add if needed for QA (e.g. `prisma db push`, `prisma migrate dev`).

---

## 9. UI system audit (for a /dev/qa page)

- **Shared components (paths):**
  - Buttons: `components/ui/button.tsx` — cva variants: default, gradient, pill, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon, icon-sm, icon-lg.
  - Card: `components/ui/card.tsx` — variants: default, elevated, priceBox; Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
  - Input/Label: `components/ui/input.tsx`, `components/ui/label.tsx`.
  - Status: `components/ui/status-pill.tsx` — variants: primary, success, warning, danger, muted.
  - Chips: `components/ui/chips.tsx`. Accordion: `components/ui/accordion.tsx`.
  - Empty state: `components/ui/empty-state.tsx`. Loading: `components/ui/loading-block.tsx`. Alert: `components/ui/alert.tsx`.
- **Admin layout:** `components/admin-nav.tsx` — links for metrics, users, listings, bookings, disputes, KYC. No separate admin layout wrapper; admin pages use same AppShell.
- **Dashboard (owner):** `components/owner/OwnerListingsSection.tsx`, `OwnerUpcomingBookings.tsx`, `OwnerQuickActions.tsx`, `OwnerStatsCards.tsx`, `OwnerListingsOverview.tsx`, `OwnerAttentionList.tsx`, `StatusTabs.tsx`.
- **Bookings:** `components/bookings/BookingsListSection.tsx`, `BookingStatusTabs.tsx`, `booking-card.tsx`.
- **Status pills/badges:** `lib/status-labels.ts` — `getBookingStatusPillVariant`, `getListingStatusPillVariant`; use with `components/ui/status-pill.tsx`.
- **Page shell:** `components/app-shell.tsx` — header (AuthHeaderLink, Logo, DevImpersonationSwitcher), main, BottomNav. Main layout: `app/(main)/layout.tsx` wraps children in AppShell.
- **Theme/tokens:** Tailwind; `app/globals.css`; design tokens (e.g. primary, success, destructive, muted) used in button and status-pill. RTL and Heebo font in root layout.

**Recommendation for /dev/qa page:** Reuse AppShell (or a minimal layout), Button, Card, StatusPill, Input/Label, Empty state, and status-labels for consistent status display. Use AdminNav if the QA page is admin-only or link to admin from QA.

---

## 10. Recommended insertion points

### Deterministic QA seeding

- **Files:** New script e.g. `prisma/seed-qa.ts` or extend `prisma/seed.ts` with a dedicated QA mode (e.g. env `SEED_QA=1`).
- **Why:** Current seed is already deterministic (fixed ids, fixed bookings). A separate QA seed or flag can add more scenarios (e.g. REQUESTED booking for admin confirm, DISPUTE for resolve) without changing default seed behavior.
- **Risks:** Seed currently deletes Booking, ListingImage, Listing, User — ensure QA seed doesn’t run against production; use same DB path as dev (e.g. `file:./prisma/dev.db`).

### Dev-only impersonation

- **Already present:** `lib/auth/dev-adapter.ts`, `lib/auth/dev-impersonation.ts`, `app/api/dev/impersonate/route.ts`, `app/api/dev/status/route.ts`, `components/dev-impersonation-switcher.tsx`. Allowed ids are fixed in `DEV_IMPERSONATION_ALLOWED_IDS`.
- **Insertion for new QA user:** Add new id to `DEV_IMPERSONATION_ALLOWED_IDS` and `DEV_IMPERSONATION_LABELS` in `lib/auth/dev-impersonation.ts`; ensure seed creates that user (e.g. in seed or seed-qa).
- **Risks:** Middleware does not run on `/api/*`; dev routes return 404 when !DEV_AUTH_BYPASS. Ensure production never sets DEV_AUTH_BYPASS.

### /dev/qa page

- **Route:** Add `app/(main)/dev/qa/page.tsx` (or `app/(main)/dev/qa/page.tsx` under a route group). Guard by DEV_AUTH_BYPASS or a dedicated env (e.g. `QA_PAGE_ENABLED=true`) and optionally require admin so only devs see it.
- **Layout:** Use existing `(main)` layout (AppShell) so header and dev switcher remain. Optionally add a small “Dev” nav item that points to `/dev/qa` only when env allows.
- **Why:** Single place for “seed”, “reset”, “open as X”, “booking lifecycle” links. Keeps dev surface in one route.
- **Risks:** If guarded only by env, ensure production does not set it. Middleware currently excludes `/api/`; if you add a path like `/dev/qa`, consider adding it to a “dev-only” check in middleware (e.g. redirect to 404 or home when !DEV_AUTH_BYPASS).

### Reset / reseed workflow

- **Touchpoints:** (1) New API route e.g. `POST /api/dev/reset` or `/api/dev/seed` that runs a reset + seed script (e.g. spawn `npx prisma db seed` or call a shared seed function). (2) Or a script only: `npm run db:seed` from CLI; no in-app button.
- **Safest:** Do not expose DB reset over HTTP in production. If exposed at all, restrict to DEV_AUTH_BYPASS and optionally NODE_ENV === 'development', and only call a function that explicitly uses the dev DB path. Prefer “run seed script from terminal” for reset.
- **Risks:** Resetting DB drops all data; ensure only dev DB is targeted. Avoid running migrations in the same request as seed (race conditions, long response).

### Lightweight QA docs

- **Location:** `docs/` — e.g. extend `docs/LOCAL_QA_WORKFLOW.md` or add `docs/QA_TEST_SCENARIOS.md` with links to /dev/qa and steps (seed, impersonate, confirm payment, resolve dispute, KYC approve).
- **Files:** Markdown only; no code. Reference env vars (redacted), route list, and “run seed then open /dev/qa”.

---

## 11. Open questions / risks

1. **DB URL in production:** Schema has no `url`; Prisma may use `DATABASE_URL` or default. Confirm production DB is never pointed at the same file as dev (e.g. `file:./prisma/dev.db`).
2. **Middleware and /dev:** Current matcher excludes `api/`; page routes like `/dev/qa` are protected only if under a path that `isProtectedPath` returns true. `/dev` is not in PUBLIC_PATHS and not in isProtectedPath, so middleware will still require auth (and onboarding) if user hits `/dev/qa`. Decide whether /dev/qa should be public when DEV_AUTH_BYPASS is on (e.g. allow /dev in middleware when bypass) or require “logged in” dev user.
3. **Impersonation cookie scope:** Cookie is set path `/`, httpOnly, sameSite lax. Ensure production never sets DEV_AUTH_BYPASS so this cookie and the impersonation API are never active.
4. **Seed idempotency:** Main seed deletes then creates; it is not idempotent for “add more data.” seed-test-users is upsert-only. A QA seed that adds REQUESTED booking or DISPUTE may need to avoid wiping if you want to keep existing users and only add scenarios.
5. **KYC upload path in tests:** KYC upload writes to `public/uploads/kyc/{userId}`. For deterministic QA, either use placeholder URLs in submit (if backend allows) or ensure one upload per user; cleanup of old files is not in scope.
6. **requireAdmin return shape:** Some call sites use `const { error, user } = await requireAdmin(); if (error) return error;`. Confirmed: adapter returns `{ user, error }`; destructuring as `{ error, user: adminUser }` is correct. No change needed; just note for future refactors.

---

*End of audit. Use this file as the single context for designing and implementing the local QA/dev testing system; do not change application code from this document alone.*
