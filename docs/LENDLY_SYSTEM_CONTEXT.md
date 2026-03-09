# Lendly — System Context

A single reference document for understanding the Lendly project. Use this file to onboard new developers or initialize an AI chat session with full project context.

---

## 1. PROJECT OVERVIEW

### What Lendly Is

- **Lendly** is a **peer-to-peer equipment rental marketplace**.
- Concept is similar to **Airbnb but for gear**: users rent items from people nearby instead of buying them.
- Focus on **local sharing economy**: typical items include tools, cameras, camping gear, electronics, DJ equipment, sports gear, and music equipment.
- The product is **Hebrew-first** (RTL) and targets the Israeli market; payments flow through **Bit**.

### Core Value Proposition

- **Cheaper than buying** — pay only for the time you need.
- **Access when needed** — get equipment for a project or event without ownership.
- **Local and convenient** — find and pick up gear from people in your area.
- **Community-based** — build trust through reviews, verification (KYC), and clear pickup/return flows.

---

## 2. CORE USER TYPES

### Renters

- People who want to **rent equipment**.
- Can: search and filter listings, view listing details, create booking requests, pay via Bit, coordinate pickup/return, complete pickup/return checklists (including condition photos), message the owner, leave reviews, and open disputes if needed.

### Owners (Lenders)

- People who **list their equipment** for rent.
- Can: create and manage listings (title, description, price, deposit, photos, availability, rules), receive booking requests, confirm bookings, manage availability and blocked dates, view owner dashboard (stats, upcoming bookings, attention list), respond to messages, and handle disputes with support.

---

## 3. CORE USER FLOWS

### A. Renting an Item

1. **Search** — Use homepage hero search or go to `/search`; filter by category, max price, sort (newest / price).
2. **Browse** — View results in list or map; load more as needed.
3. **View listing** — See details, photos, price per day, deposit, location, trust badges (KYC, reviews, completed bookings), pickup notes, rules.
4. **Request / book** — Choose dates, create booking (status: REQUESTED); go to checkout.
5. **Pay** — Checkout page shows summary; pay via Bit (payment link); admin can confirm payment manually; renter gets confirmation.
6. **Pickup** — Pickup instructions visible; complete pickup checklist (condition, accessories, photos); coordinate with owner via messages.
7. **Return** — Return item; complete return checklist (condition, damage/missing reported if any); owner confirms.
8. **After return** — Deposit released (or dispute flow); both sides can leave a **review** (rating 1–5 + optional body).

### B. Listing Equipment

1. **Create listing** — Go to `/add`; multi-step wizard: basic info (category, title, description) → pricing & location (price per day, deposit, city, value estimate) → photos → pickup notes & rules → summary.
2. **Upload photos** — One or more images; order matters for display.
3. **Set price** — Price per day, deposit, optional value estimate (NIS).
4. **Define availability** — Listing has blocked date ranges; owner can manage these from listing manage page.
5. **Publish** — Listing status: DRAFT → PENDING_APPROVAL → ACTIVE (or REJECTED/PAUSED). Moderation is admin-driven.
6. **Receive requests** — Bookings appear in owner dashboard; payment confirmed by admin; owner and renter use messaging and checklists for pickup/return.

### C. Trust and Safety

- **Reviews** — After a completed booking, author can leave a review for the other user (rating + optional text); displayed on profiles and listing context.
- **Profiles** — User has name, optional image, city; KYC status and review history support trust.
- **Communication** — Per-booking conversation thread (messages) for coordination.
- **Equipment condition** — Pickup and return checklists with condition confirmation and optional photos (front, side, accessories) to reduce disputes; damage/missing can be reported on return and open a **dispute** (admin-reviewed).

---

## 4. PRODUCT FEATURES CURRENTLY IMPLEMENTED

### Homepage (`/home`)

- **Hero** — Full-width (desktop: 80% hero + 20% category sidebar); rotating background images (party, gardening, camping, DIY); headline; hero search bar; upload/sign-in CTA; trust one-liner.
- **Category discovery** — Desktop: left sidebar with segment tabs (All, Media, Outdoor) and category links; mobile: card below hero with same component.
- **Trust strip** — Mobile-only one-liner (e.g. “מאומתים · פיקדון מגן · קהילה עם ביקורות ותמיכה”).
- **Featured listings** — Grid of listing cards (up to 12); “See all” link to `/search`.
- **How it works** — Three steps: search → pay (Bit) → pickup/return.
- **Testimonials** — One primary quote + image; three secondary cards.
- **Why Lendly (למה להשתמש בלנדלי)** — Six benefits (deposit, verified community, savings, local, flexible dates, sustainability); icon grid.
- **FAQ** — Accordion block (home FAQ items); link to full FAQ.
- **Final CTA** — “Ready to start?” with search + upload/sign-in buttons; help/FAQ links.
- **Responsive** — Mobile-first; desktop uses side-by-side hero + categories and combined Why Lendly + FAQ column layout.

### Search (`/search`)

- **Search input** — Text query; URL params: `q`, `category`, `max`, `sort`, `page`, `view`.
- **Category filters** — Chips (All + category list from constants); category dropdown in filters card.
- **Filters card** — Category, sort (newest / price), max price slider (0–2000 NIS); “Clear filters”.
- **Listings grid** — List or map view; toggle synced to URL (`view=list` / `view=map`).
- **Load more** — Pagination; “Load more” fetches next page and appends.
- **Map** — Google Maps with markers/clustering when `view=map`.
- **Empty/error** — Empty state and error message with retry.

### Listings

- **Listing cards** — Image, title, price per day, location, category, trust badges (KYC, phone, completed bookings, reviews, rating); used on homepage, search, owner dashboard.
- **Listing detail page** (`/listing/[id]`) — Image carousel, title, status pill, price, deposit, location, category, description, pickup notes, rules, trust badges, “Request booking” CTA (or owner manage link), FAQ block (deposit/disputes).
- **Listing manage** (`/listing/[id]/manage`) — Owner: edit listing, blocked dates/availability, linked bookings.

### User Accounts

- **Authentication** — NextAuth (e.g. Google); sign-in at `/signin`; root `/` redirects: signed-in → `/search`, signed-out → `/home`.
- **Profile** — `/profile`: user info; link to KYC and other settings.
- **KYC** — Identity verification (selfie + ID); status: PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED; affects trust badges and booking permissions.
- **Onboarding** — Post-sign-up onboarding flow (e.g. name, phone, city) at `/onboarding`.

### Bookings

- **My bookings** — `/bookings`: list of user’s bookings with status tabs (e.g. requested, confirmed, active, completed, dispute).
- **Booking detail** — `/bookings/[id]`: dates, listing, payment status, deposit, pickup/return instructions, links to pickup/return flows, messages, leave review (when completed).
- **Pickup flow** — `/bookings/[id]/pickup`: pickup checklist (condition, accessories, notes, photos).
- **Return flow** — `/bookings/[id]/return`: return checklist (condition, damage/missing, notes).
- **Messages** — Per-booking conversation thread.

### Checkout & Payments

- **Checkout** — `/checkout?bookingId=...`: booking summary, total, payment via Bit (payment link); copy booking ref (LND-XXXXXX); FAQ; admin can confirm payment (manual confirmation supported).

### Reviews

- **Leave review** — Form after completion: 1–5 stars + optional body; one review per user per booking.
- **Display** — Review cards with rating, body, author, target; used on listing and profile context.

### Admin

- **Admin area** — KYC review, listing moderation (approve/reject/pause), user management (including suspend/unsuspend), booking list, dispute resolution (open/under review/resolved), confirm payment override; audit log for key actions.

### Help

- **Help center** — `/help`; sub-pages: FAQ, getting started, safety, insurance terms.

---

## 5. CURRENT HOMEPAGE STRUCTURE

Sections in order (top to bottom):

1. **Hero section**
   - **Desktop**: Left 20% = category discovery sidebar (segment tabs + category links). Right 80% = hero: rotating background images, gradient overlay, headline (“שכרו ציוד מאנשים לידכם — או השכירו את שלכם”), search bar + “חפשו” button, trust one-liner, “השכר ציוד” / “משכירים? התחברו עם Google” at bottom-right.
   - **Mobile**: Logo above headline; headline; search input; “העלו מודעה” or sign-in link; no sidebar; category discovery in a card below.

2. **Category discovery (mobile only as separate section)**
   - Card with segment tabs and category links; same content as desktop sidebar.

3. **Trust one-liner (mobile only)**
   - Centered short line (e.g. verified, deposit, community).

4. **Featured listings**
   - Section title “השכרות אחרונות”; grid of listing cards (1–2 cols mobile, up to 6 on large desktop); “כל ההשכרות” button.

5. **How it works (איך זה עובד)**
   - Section title; three steps with number, icon, title, description (search → pay → pickup/return).

6. **Testimonials (מה אומרים המשתמשים)**
   - Top row: main testimonial (quote + stars + avatar + name/city) + supporting landscape image.
   - Bottom row: three compact testimonial cards in a row (or stack on mobile).

7. **Why Lendly + FAQ (single section, side-by-side on large desktop)**
   - **Why Lendly (למה להשתמש בלנדלי)** — Title, subtitle, 2×3 grid of benefits (icon, title, description).
   - **FAQ (שאלות נפוצות)** — Accordion with home FAQ items; “כל השאלות והתשובות” link to `/help/faq`.
   - On desktop (lg): one row, ~17fr + 8fr columns; on smaller screens stacked.

8. **Final CTA**
   - Rounded card: “מוכנים להתחיל?”; short line; “חפשו השכרות” + upload/sign-in buttons.
   - Below: tagline and help/FAQ links.

**Layout notes**

- Hero is full-bleed (edge-to-edge) with no inner max-width; content below uses `max-w-md` (mobile) or `max-w-7xl` / `max-w-[90rem]` for readability.
- Featured listings use a wider container (`max-w-[160rem]`) so cards can be large.
- Testimonials use `max-w-[85rem]`; Why Lendly + FAQ share a single section with a grid on desktop to avoid heavy section slabs and keep one “under-the-fold” band.

---

## 6. DESIGN SYSTEM

### Color Palette

- **Mint / teal accent** — `--mint-accent: #2FBF9F`, `--mint-accent-hover: #26A98C`; primary CTAs, icon circles, links, selected states.
- **Primary** — `--primary: #50C878` (green); buttons, focus rings, sidebar.
- **Home gradient** — `--home-gradient-start: #E6F4FF`, `--home-gradient-end: #D9FBE8`; hero and category sidebar; soft blue → mint.
- **Surfaces** — `--background: #F8FAFA`, `--card: #ffffff`, `--muted: #EAECEC`; neutral backgrounds and cards.
- **Text** — `--foreground: #0f172a`, `--muted-foreground: #64748b`.
- **Semantic** — Success, warning, destructive, accent (e.g. purple) for specific UI states.

### Design Principles

- **Airy layout** — Generous spacing; avoid dense blocks.
- **Premium marketplace feel** — Clean, trustworthy; not cluttered.
- **Minimal but warm** — Soft gradients and mint accents; Heebo for typography.
- **Card-based UI** — Content in cards with soft shadows and rounded corners.

### Components and Patterns

- **Cards** — `rounded-card` (20px), `shadow-card`, border; used for listing cards, testimonials, FAQ, filters.
- **Shadows** — `shadow-soft`, `shadow-medium`, `shadow-card`, `shadow-cta` (mint glow for primary CTAs).
- **Radius** — `--radius-sm` through `--radius-xl`, `--radius-card`; consistent rounding.
- **Icon circles** — Mint-tinted background (`bg-[var(--mint-accent)]/15`), mint icon; used in Why Lendly, How it works, testimonials.
- **Grids** — Responsive grids for listing cards, benefits, testimonials; 1–2 cols mobile, 2–3–6 cols desktop.
- **Section titles** — `.section-title` (base font semibold); `.page-title` for main page heading.
- **RTL** — `dir="rtl"` and `text-right` where needed; layout and nav respect RTL.

### Typography

- **Font** — Heebo (`--font-heebo`) for UI and body; Geist Mono for code if used.
- **Hierarchy** — Section title, page title, body, small/muted helper text.

---

## 7. TECH STACK

### Frontend

- **Next.js 16** — App Router; React 19.
- **TypeScript** — Typed components and API.
- **Tailwind CSS 4** — Utility-first styling; `@tailwindcss/postcss`; custom theme in `globals.css`.
- **Component architecture** — Reusable UI in `components/ui`; feature-specific in `components/home`, `components/listings`, etc.
- **Lucide React** — Icons.
- **Radix UI** — Accordion, Slot (primitives) for accessible components.
- **class-variance-authority (cva)** + **clsx** + **tailwind-merge** — Button variants and class merging.

### Backend

- **Next.js API routes** — Under `app/api/`: listings (CRUD, search, upload, availability, blocked ranges, reviews), bookings (CRUD, messages, pickup/return checklists, checklist photos, disputes), payments (create-intent, confirm), checkout summary, profile/onboarding, KYC submit/upload, admin (users, listings, bookings, disputes, KYC, metrics).
- **Database** — SQLite (Prisma); file-based for dev/QA.

### Authentication

- **NextAuth 4** — Google provider; session and callbacks in `lib/auth/nextauth-options.ts`; adapter for Prisma (or custom) for user persistence.
- **Session** — `getCurrentUser()` (and optional admin check) used in layout and pages; dev impersonation for QA.

### Data Layer

- **Prisma 7** — ORM; schema in `prisma/schema.prisma`.
- **Models** — User (with KYC, suspension), Listing (with status, images, blocked ranges), Booking (with payment/deposit status, checklists, conversation), Review, Conversation, Message, Dispute, PickupChecklist, ReturnChecklist, BookingChecklistPhoto, ListingImage, AuditLog; enums for ListingStatus, BookingStatus, PaymentStatus, DepositStatus, KYCStatus, DisputeStatus.

### Other Libraries

- **Resend** — Transactional email (booking lifecycle, dispute opened/resolved).
- **@vis.gl/react-google-maps** — Map and markers on search.
- **@googlemaps/markerclusterer** — Clustering for map markers.
- **tw-animate-css** — Animations.

---

## 8. CODEBASE STRUCTURE

- **`app/`** — Next.js App Router.
  - **`app/page.tsx`** — Root: redirect signed-in → `/search`, signed-out → `/home`.
  - **`app/(main)/`** — Main layout (AppShell): header, main, bottom nav; routes: `home`, `search`, `listing/[id]`, `listing/[id]/manage`, `add`, `bookings`, `bookings/[id]`, `bookings/[id]/pickup`, `bookings/[id]/return`, `bookings/[id]/messages`, `checkout`, `profile`, `profile/kyc`, `onboarding`, `owner`, `help`, `help/faq`, `help/getting-started`, `help/safety`, `help/insurance-terms`, `signin`, `admin/*`, `dev/qa`.
  - **`app/api/`** — API routes (listings, bookings, payments, checkout, me, auth, kyc, admin).
  - **`app/layout.tsx`** — Root layout (fonts, body).
- **`components/`** — UI and feature components.
  - **`components/ui/`** — Button, Card, Input, Label, Alert, Accordion, Chips, FAQBlock, EmptyState, LoadingBlock, StatusPill, StickyCTA, TrustCTARow, ListingCardSkeleton.
  - **`components/home/`** — HeroSection, HeroExperienceBackground, HeroCategoryDiscovery, DesktopCategoryDiscovery, CategoryDiscoveryPanel, FeaturedListings, HowItWorks, Testimonials, WhyLendly, TrustStrip, HomeHeroNav, OwnerCTA.
  - **`components/listings/`** — ListingCard (in root), ListingImageCarousel, ListingsMap, ListingAvailabilityCalendar, ListingAvailabilityLegend, BlockDateRangeDialog.
  - **`components/bookings/`** — BookingsListSection, BookingStatusTabs, etc.
  - **`components/owner/`** — OwnerStatsCards, OwnerAttentionList, OwnerListingsSection, OwnerUpcomingBookings, OwnerQuickActions, OwnerListingsOverview, StatusTabs.
  - **`components/reviews/`** — ReviewCard.
  - **Other** — app-shell, header-nav, bottom-nav, logo, search-input, auth-header-link, sign-in-google-button, create-booking-cta, trust-badges, kyc-flow, admin-kyc-review, etc.
- **`lib/`** — Business logic and shared utilities.
  - **`lib/auth/`** — nextauth-options, adapter, session-adapter, onboarding, dev-adapter, dev-impersonation, types.
  - **`lib/copy/`** — help-reassurance (FAQ items, testimonials, Why Lendly, trust copy).
  - **`lib/email/`** — send, client, templates (booking lifecycle, dispute).
  - **`lib/trust/`** — badges (compute trust badges for listings).
  - **`lib/payments/`** — adapter, types (Bit integration).
  - **`lib/`** — prisma, admin, booking-auth, listings, availability, pricing, status-labels, constants (categories, cities), utils, audit, booking-ref, notifications.
- **`prisma/`** — schema.prisma, seed, migrations (if any).
- **`docs/`** — Project documentation (e.g. this file, QA/review dumps).
- **`public/`** — Static assets; hero images under `hero/`.

---

## 9. CURRENT DESIGN GOALS

- **Smooth homepage background** — Single soft gradient wash (blue–mint mix with background) so the whole page feels one surface; no harsh bands.
- **Fewer heavy section slabs** — Prefer white cards on a subtle atmospheric background; combine related content (e.g. Why Lendly + FAQ in one section).
- **White cards on subtle background** — Content in cards; background stays light and gradient-tinted.
- **Premium but minimal UI** — Clear hierarchy, plenty of whitespace, consistent radius and shadows.
- **Responsive layouts** — Mobile-first; hero and category discovery adapt (stack vs sidebar); grids collapse to 1–2 columns on small screens.
- **Hero flow** — Smooth transition from hero image to content (gradient overlay); no visible seam between hero and next section.

---

## 10. KNOWN DESIGN ISSUES OR AREAS OF ACTIVE WORK

- **Homepage section flow** — Continuity between hero, featured listings, how it works, testimonials, and Why Lendly + FAQ is still refined; avoiding “section soup” and visual seams.
- **Testimonial layout** — Balance of primary quote + image and secondary cards; responsive behavior (stack vs row).
- **Benefits + FAQ layout** — Side-by-side on large desktop; ensuring alignment and spacing (e.g. `lg:grid-cols-[17fr_8fr]`) and consistent padding.
- **Background surface consistency** — Keeping one cohesive page background (e.g. `home-page-bg`) across sections so no grey or alternate bands break the gradient feel.
- **Removing visual seams** — Hero to content transition; category card (mobile) to featured listings; ensuring shadows and borders don’t create hard lines between sections.

---

## 11. PRODUCT VISION

- Become the **go-to marketplace for renting equipment locally** in the target market (Israel, Hebrew-first).
- **Enable sharing economy behavior** — Make it normal to rent instead of buy for occasional needs.
- **Reduce unnecessary purchases** — Tools, gear, and one-off items used via rental.
- **Community-driven rentals** — Trust through verification (KYC), reviews, clear pickup/return and dispute resolution; platform as facilitator, not inventory owner.

---

## HOW TO USE THIS FILE IN A NEW CHAT

To give an AI assistant (or a new developer) full project context in a new chat:

1. **Paste this file** (or the relevant sections) into the first message, or attach it as context.
2. **Optionally add** the path: `docs/LENDLY_SYSTEM_CONTEXT.md`.
3. **State the task** (e.g. “Add a new filter to search,” “Change the hero headline,” “Fix the booking status flow”).

The assistant will have a shared understanding of what Lendly is, how it works, what’s implemented, how the homepage and design system are structured, and where to look in the codebase. For deeper implementation details, point to specific files (e.g. `app/(main)/home/page.tsx`, `lib/listings.ts`, `prisma/schema.prisma`) as needed.
