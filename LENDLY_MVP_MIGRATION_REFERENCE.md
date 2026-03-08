# Lendly MVP — Migration Reference (Design & UX Extraction)

**Purpose:** Extract design patterns, UI/UX elements, and product ideas from the older "Lendly MVP" source (`Lendly MVP\lendly\` and related `Lendly\lendly\`) for safe, incremental porting into the current repository ("Lendly Tom").  
**Rules:** Do not assume old architecture is correct; treat MVP as a source of design/UX/feature ideas only. Do not port backend blindly. Manual Bit payment and fixed booking lifecycle in Lendly Tom must remain unchanged.

---

## 1. DESIGN INVENTORY

### Page layout patterns

| Element | Where in MVP | Description |
|--------|----------------|-------------|
| **Single-column with bottom nav** | All main pages | Content in one column; fixed bottom nav (rounded pill bar, 3 items: הודעות, בית, פרופיל). `app/[locale]/page.tsx`, `bottom-nav.tsx`. |
| **Hero → filters → results / popular** | Home | Hero area (search + categories) at top; below it either search results (horizontal scroll) or "Popular Rentals" carousel. Clear visual separation. |
| **Full-screen modal sheet** | Listing detail (popup) | Listing opens in a bottom-sheet style modal (slide up from bottom, rounded-t-3xl), not a separate page. Scrollable content; sticky CTA at bottom. `ListingModal.tsx`. |
| **Step wizard with sticky header** | Listing creation, availability step | Sticky header with back + title + step context; gradient background (e.g. `linear-gradient(to bottom, #F8FCF5 0%, #EEF7F0 100%)`); content scrollable; CTA bar above nav. `list-item-step-availability.tsx`. |
| **Filter card (collapsible)** | Hero, Search | "Advanced filters" button below search; expanding card with gradient background (`#F7FBFB` → `#E6F3F3`), border, internal sections (location, price slider, rating stars, date range, insurance switch), search + clear buttons. `hero-area-with-filters.tsx`. |

**References:** `Lendly MVP\lendly\app\[locale]\page.tsx` (layout of hero → results / popular); `Lendly MVP\lendly\components\hero-area-with-filters.tsx` (filter card structure, AnimatePresence); `Lendly MVP\lendly\components\listing-modal\ListingModal.tsx` (sheet layout, scroll + sticky CTA); `Lendly MVP\lendly\components\list-item-step-availability.tsx` (wizard step layout).

### Visual hierarchy

- **Primary teal/green:** `#23B3B2`, `#00AFA3`, `#50C878`, `#41B464`, `#00B8B8` used for CTAs, links, accents, category chips gradient.
- **Gradient chips:** Category chips use 3-color gradient (`#23B3B2` → `#3BC4C3` → `#53D5D4`) with soft inner shadow and glossy overlay for depth.
- **Card hierarchy:** White cards on light green-tinted backgrounds; borders `#E6F3F3`; shadows `0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)` for listing cards.
- **Section headers:** Section title in primary color (e.g. "תוצאות", "השכרות באיזורך") with optional "see all" link in same color; consistent `text-lg` / `text-base` font-semibold.
- **Body gradient (optional):** `BodyGradient` applies full-page gradient (e.g. green to white) for light mode; dark mode separate. Not required for Tom; can be skipped or simplified.

**References:** `category-chip.tsx` (gradient + overlay); `listing-card.tsx` (shadow, border); `body-gradient.tsx`; `hero-area-with-filters.tsx` (card gradient).

### Hero sections

- **Integrated hero:** No separate hero block; hero = search bar + "Advanced filters" button + category chips row. Tagline/headline can sit above (not in read files; home uses `HeroAreaWithFilters` only).
- **Search-first:** Location-style search input with rotating Hebrew placeholders (e.g. מקדחה, מצלמה, ציוד אירועים); optional "Get location" (geolocation); primary-colored focus.
- **Category row:** Horizontal scroll of gradient category chips with icons (Camera, Drone, Wrench, Music, Tent, Dumbbell); link to `/category/[key]`; active state from URL or local state; RTL scroll; fade hints on scroll edges (optional).

**References:** `hero-area-with-filters.tsx` (search + filters + categories); `location-input.tsx` (placeholders, geolocation); `category-chips.tsx`, `category-chip.tsx`.

### Listing cards

- **Sizes:** Default ~208px width; compact ~112px; fullWidth for carousel cells (182px in popular section).
- **Content:** Image (aspect, lazy, error fallback "No Image"); top-left badges (insurance, in demand) with BadgeCheck icon and primary background; title (2-line clamp); price row (primary color ₪/יום).
- **Interaction:** Click opens ListingModal (no navigation); touch vs scroll distinguished (horizontal scroll in carousel doesn’t open modal); motion scale on hover (1.02) and tap (0.97); spring animation.
- **Skeleton:** `ListingCardSkeleton` with Skeleton blocks for image and text; used in loading state of Popular Rentals.

**References:** `Lendly MVP\lendly\components\listing-card.tsx` (full card, badges, motion, modal trigger); `ListingCardSkeleton` in same file.

### Category navigation

- **Chips with icons:** Each category has icon (Lucide) + label; gradient pill; href to `/category/[key]`; active state (scale 1.02); scroll container with scrollbar-hide; RTL.
- **Scroll feedback:** Optional left/right fade when not at start/end (category-chips checks scroll position).

**References:** `category-chips.tsx`, `category-chip.tsx`.

### Filters / sorting UI

- **Collapsible filter card:** Toggle "Advanced filters" with Filter icon + ChevronDown; card expands with: precise location input, price range slider (0–1000, step 10) with ₪ labels, minimum rating (1–5 star buttons), availability (date range popover + Calendar), "Only with insurance" switch, "Show results" button, "Clear filters" text button.
- **Price slider:** Slider component with two thumbs; labels below (min–max); centered summary "₪X – ₪Y".
- **Rating filter:** Row of 5 Star icons; click sets min rating; filled with primary color.
- **Date range:** Popover with Calendar (range mode); locale-aware (he/enUS); 1 or 2 months by viewport.
- **Insurance toggle:** Switch; when on, filter to listings with insurance.
- **Clear filters:** Resets all and clears results; only reported to parent when explicitly cleared (avoids loops).

**References:** `hero-area-with-filters.tsx` (full filter UI); search page reuses same pattern.

### Trust badges / trust sections

- **On listing card:** Badges in top-left: "ביטוח" (insurance), "בביקוש" (in demand) — small pill, primary color, BadgeCheck icon.
- **In listing modal:** Price summary row with Shield + "כולל ביטוח" or "ביטוח בתוספת תשלום"; tags under hero image: "ביטוח כלול", "זמין" (pill style).
- **Owner block in modal:** Avatar (initials or image), name, rating (star + number), "בעלים • X השכרות"; "צ'אט" button.
- **OwnerSection (standalone):** Avatar, name, "Verified" badge (CheckCircle2, green), "Show more from owner" link. Trust score and verified flag in props.
- **TrustStrip (other codebase):** Three trust features (insured/verified, instant booking, local community) in grid; icon in tinted box; title + short description. Good for landing/help.

**References:** `listing-card.tsx` (hasInsurance, isInDemand badges); `ListingModal.tsx` (insurance in price row, tags, owner card); `OwnerSection.tsx` (verified badge); `Lendly\lendly\src\components\home\TrustStrip.tsx`.

### Pricing display

- **Listing card:** "₪{dailyRate}" bold primary + "/יום" muted.
- **Listing modal:** "מחיר ליום" label; large price + currency; below: Shield + insurance text; "מינימום X ימים" pill.
- **PriceBox (standalone):** Centered; large price (text-4xl) + "ליום"; optional "כולל ביטוח" in green; gradient card (from-[#E6F7F0] via-white to-[#F0F9F5]), border primary/10, shadow.

**References:** `ListingModal.tsx` (price summary block); `PriceBox.tsx`; `listing-card.tsx`.

### Booking stepper / progress UI

- **Wizard steps:** Listing create has 4 steps (basic info, photos, pricing, availability); step context in header (e.g. "שלב X"); progress can be a bar (not in read availability step; basic-info has validation and "Next").
- **Availability step:** Sticky header with back + title; calendar for blocked dates; primary CTA at bottom; gradient background.
- **No explicit stepper dots** in read files; step state is in parent.

**References:** `list-item-step-basic-info.tsx` (validation, next); `list-item-step-availability.tsx` (header, CTA bar).

### Profile cards

- **ProfileForm:** Card with avatar (upload), name, bio; trust score and role; edit + save. Avatar fallback initials.
- **Owner in modal:** Rounded avatar (gradient or image), name, rating, "בעלים • X השכרות", chat button.

**References:** `profile-form.tsx`; `ListingModal.tsx` (owner card); `OwnerSection.tsx`.

### Review presentation

- **ReviewModal:** Dialog; title "Rate {toUserName}"; description "How was your experience?"; star rating (1–5, hover state); optional text; submit. Toast success/error.
- **Listing modal:** Rating shown as star + number + "(X ביקורות)" in meta row.

**References:** `review-modal.tsx`; `ListingModal.tsx` (rating in meta).

### Status badges

- **Listing card:** Insurance, In demand (small pills, top-left).
- **Listing modal:** Tags "ביטוח כלול", "זמין" at bottom of hero.
- **OwnerSection:** "Verified" badge (green, CheckCircle2).
- **StatusTabs (lender):** Tabs with counts: הכל, פעילים, ממתינים לאישור, מושהים, בעיות; active = primary solid; inactive = white border.

**References:** `listing-card.tsx`; `ListingModal.tsx`; `OwnerSection.tsx`; `lender/StatusTabs.tsx`.

### Empty states

- **Search no results:** Card with Search icon (primary), title "noResults", subtitle "filterHelperText"; soft green tint background, border E6F3F3.
- **Popular rentals empty:** Card with MapPin icon, "noNearbyListings", short copy, CTA button "viewAllListings" (primary).
- **EmptyState component:** Icon (default Package), title, optional subtitle, optional CTA (Link + gradient button); variant full (card) vs inline (text only).

**References:** `app/[locale]/page.tsx` (search empty); `popular-rentals-area.tsx` (empty); `common/EmptyState.tsx`.

### Onboarding visuals

- **Not fully read;** wizard steps (basic info, photos, pricing, availability) imply step-by-step with validation and back/next. Suggested tags in basic info (e.g. מצב חדש, כולל תיק נשיאה).

**References:** `list-item-step-basic-info.tsx` (suggestedTags, categories with icons).

### CTA patterns

- **Primary CTA:** Full-width; rounded-full or rounded-2xl; gradient (e.g. from-[#00AFA3] to-[#00C7B7] or from-[#41B464] to-[#00B8B8]); white text; shadow (e.g. 0 14px 30px rgba(0,140,125,0.35)); press scale 0.96.
- **Sticky CTA bar:** Gradient strip at bottom (from-white via 98% to 95%); border-t; shadow up; primary button + optional secondary "שאל שאלה" / "תורוינו מהציוד שלכם"; footer row with Shield, Clock, Info (free cancellation, support 24/7, insurance).
- **Floating lender CTA popup:** Appears after 15s, then every 5 min; gradient button "תרוויחו מהציוד שלכם"; bounce animation; close button; above bottom nav.
- **Secondary CTA:** Outline or border-2 primary; "צ'אט" or contact owner.

**References:** `ListingModal.tsx` (sticky CTA, "הזמנת השכרה", "שאל שאלה"); `StickyCTA.tsx` (footer trust row); `floating-lender-cta-popup.tsx`; `listing-card.tsx` (click → modal).

### Navigation patterns

- **Bottom nav:** 3 items (messages, home, profile); rounded-2xl bar; primary background (#23B3B2); icons + labels; active = white + bottom bar indicator; centered, max-w-[480px], above safe area.
- **Listing flow:** Card click → modal (no route change); "הזמנת השכרה" → router.push listing page; "צ'אט" → listing with ?tab=messages.
- **Category:** Chips link to `/category/[key]`; search uses same filters as hero.

**References:** `bottom-nav.tsx`; `ListingModal.tsx` (handleBook, handleChat).

### Mobile-first / RTL-friendly ideas

- **RTL:** `dir="rtl"` on container; Popover align/side flip (align end, side left for RTL); Calendar locale he/enUS; flex-row-reverse where needed; chevron rotation for dropdown (rotate-180 when open + RTL).
- **Touch:** Distinguish scroll vs tap on listing card (touch start/move/end, scroll threshold); swipe on modal image carousel (minSwipeDistance 50); drag carousel (Popular Rentals) with snap.
- **Viewport:** useIsRTL(); mobile check (e.g. window.innerWidth < 768) for single vs double calendar month.
- **Safe area:** Bottom nav uses bottom-3 and can account for env(safe-area-inset-bottom) in floating popup.

**References:** `hero-area-with-filters.tsx` (RTL, mobile); `listing-card.tsx` (touch vs scroll); `ListingModal.tsx` (swipe); `popular-rentals-area.tsx` (drag, RTL); `floating-lender-cta-popup.tsx` (safe area).

### Admin UI polish patterns

- **StatusTabs:** Horizontal scroll tabs with counts; active primary; inactive bordered; snap.
- **KPICard:** Title (small), value (large), optional icon and trend (↑/↓ %); motion delay by index; border E6F3F3, rounded-xl.

**References:** `lender/StatusTabs.tsx`; `lender/KPICard.tsx`.

---

## 2. COMPONENT / UI PATTERN INVENTORY

| Pattern | What it does | Where it appears | Why it improves UX |
|--------|----------------|-------------------|---------------------|
| **Cards** | Container with border, shadow, rounded corners; variants for filter (gradient), listing (fixed height), empty state, price summary. | Hero filters, listing card, modal content, empty states, KPICard. | Clear grouping; consistent depth and hierarchy. |
| **Chips** | Filter chip (selected/unselected border+bg); category chip (gradient pill with icon + label, link). | Categories row, filter state. | Quick scanning and selection; category chips feel tactile. |
| **Badges** | Small pills: insurance, in demand, verified, tags (ביטוח כלול, זמין). | Listing card top-left; modal tags; owner section. | Trust and clarity at a glance. |
| **Carousels** | Image carousel in modal (arrows, dots, swipe); listing cards horizontal scroll (Popular Rentals) with drag-to-snap, 2 cards visible. | Listing modal; home "Popular". | Rich media; browsable list without leaving page. |
| **Galleries** | Same as carousel; multiple images with index, prev/next, touch swipe. | ListingModal hero. | Full listing imagery. |
| **Tabs** | Status tabs (all, active, pending, paused, issues) with counts; horizontal scroll, snap. | Lender dashboard. | Filter list without leaving page; counts set expectations. |
| **Segmented controls** | Filter card open/close; advanced filters toggle. | Hero, Search. | Progressive disclosure; less clutter. |
| **Sticky action bars** | Sticky bottom bar: gradient strip, primary CTA, optional secondary + trust row (Shield, Clock, Info). | Listing modal; listing page (StickyCTA). | Always-visible next step; trust copy reduces friction. |
| **Drawers/Sheets** | Full-screen modal sheet from bottom (listing detail); rounded top; scrollable body; sticky CTA. | ListingModal. | Mobile-native feel; quick view without full navigation. |
| **Accordions** | FAQ by category; AccordionItem with trigger + content. | Help FAQ page. | Scannable Q&A; expand only what’s needed. |
| **Info banners** | IssuesSection: amber bg, AlertTriangle icon, "X הערות" + "למידע נוסף". | Listing (when issueCount > 0). | Surfaces problems without blocking. |
| **Trust blocks** | Owner card (avatar, name, rating, rentals count, chat); TrustStrip 3-column (icon, title, description). | Modal; landing. | Builds confidence in owner and platform. |
| **FAQ sections** | Grouped by category (Security Deposits, Insurance, Bookings, Payments, Account); HelpCircle icon, heading, cards per category. | Help FAQ. | Find answers by topic. |
| **Step indicators** | Wizard step context in header (e.g. "שלב X"); optional progress bar. | Listing create. | Clear progress and what’s left. |
| **Info rows** | Label + value pairs (e.g. "מחיר ליום", "מינימום X ימים"); icon + text (MapPin, Calendar). | Modal price, pickup, owner. | Scannable details. |
| **Stat blocks** | KPICard: title, value, optional trend. | Lender dashboard. | At-a-glance metrics. |
| **Skeletons / loading** | ListingCardSkeleton (image + text blocks); 3–4 in a row during load. | Popular Rentals loading. | Perceived performance; no layout shift. |
| **Success/error states** | Toast (sonner) for success/error; inline error divs (e.g. destructive/10); validation shake on form. | Review, checklist, profile, listing steps. | Clear feedback. |

**References:** As in Design Inventory; plus `IssuesSection.tsx`, `help/faq/page.tsx`, `review-modal.tsx`, `pickup-checklist-modal.tsx`, `list-item-step-basic-info.tsx` (shake).

---

## 3. FEATURE INVENTORY

| Feature | In MVP | Portable to Tom? | Notes |
|--------|--------|-------------------|--------|
| **Listing presentation** | Modal sheet with carousel, price card, quick features row, description expand, pickup/availability, owner card, tags (insurance, זמין). | Yes (UI only). | Keep Tom’s page-based detail; add modal option or reuse patterns (price card, owner block, tags) on existing page. |
| **Richer search/filtering** | Location + precise location, price range slider, min rating (stars), date range, insurance toggle; collapsible card; clear filters. | Yes. | Tom has category, sort, min/max price; add slider, rating filter, date range, insurance switch; keep API contract. |
| **Improved booking UX** | Sticky CTA with "הזמנת השכרה" + "שאל שאלה"; trust row (free cancellation, 24/7, insurance). | Yes. | Add secondary "contact owner" and trust microcopy; do not change booking lifecycle. |
| **Trust/KYC surfaces** | Owner verified badge; trust score in profile; TrustStrip (insured, instant booking, community). | Partially. | Tom has KYC and trust badges; add "Verified" where applicable; TrustStrip good for help/landing. |
| **Owner tools** | StatusTabs (all/active/pending/paused/issues); KPICard (title, value, trend); charts (ChartBookings, ChartRevenue); SummaryStrip; FloatingActionButton. | Yes (UI). | Port StatusTabs and KPICard to owner dashboard; charts only if Tom has metrics. |
| **Renter tools** | Search results on home; popular carousel; modal quick view; filters. | Yes. | Tom already has search and home; add popular carousel and/or modal quick view if desired. |
| **Availability UX** | Calendar for blocked dates; ranges; step in wizard. | Yes. | Tom has blocked ranges and manage page; port calendar UX and range selection if needed. |
| **Profile enhancements** | Avatar upload; bio; trust score display; role. | Partially. | Tom has profile; add avatar/bio if API supports; trust score = existing badges or aggregate. |
| **Messaging / dispute / review** | Chat from modal; ReviewModal (dialog, stars, text); IssuesSection on listing. | Yes (UI). | Tom has messaging and reviews; port ReviewModal as alternative to inline form; IssuesSection if Tom has "issues" concept. |
| **Dashboards** | Lender: tabs, KPI cards, charts, listing cards. | Yes (UI). | Enrich owner page with StatusTabs + KPICards; charts only if data exists. |
| **Notifications** | Not in read files. | — | — |
| **Saved / favorites** | Not in read files. | — | — |
| **Recommendations** | "Popular Rentals in Your Area" (nearby hook); no explicit algo. | Partially. | Tom can add "near you" or "popular" section; keep as static or simple query. |
| **Featured categories** | Category chips link to `/category/[key]`. | Yes. | Tom has categories; ensure route and chips match. |
| **FAQ / help / support** | FAQ page with categories (Security, Insurance, Bookings, Payments, Account); accordion; contact/support link. | Yes. | Tom has help; port FAQ structure and copy (adapt payment/deposit to Bit + manual confirmation). |
| **Conversion / friction** | Floating lender CTA; sticky CTA with trust row; clear filters; empty state with CTA; one-tap open modal. | Yes. | All are UI/copy; no backend change. |

---

## 4. FLOW INVENTORY

| Flow | Screens / components | UX advantages | Portable to Tom |
|------|----------------------|----------------|------------------|
| **Homepage discovery** | Hero (search + categories) → search results OR popular carousel; floating lender popup. | Single place to search or browse; popular reduces empty state. | Add popular/nearby section; keep hero + search; optional floating CTA. |
| **Browse/search** | Search page or in-place results; LocationInput, CategoryChips, collapsible filters (price, rating, dates, insurance); results as horizontal scroll or grid; empty state. | One search surface; progressive filters; clear empty state. | Add advanced filters (slider, rating, dates, insurance) and clear; keep Tom’s API. |
| **Listing detail** | Card click → modal sheet (carousel, price, features, description, pickup, owner, tags); sticky CTA "הזמנת השכרה" + "שאל שאלה". | Quick view without leaving list; clear CTA and trust. | Optional: modal quick view; or keep full page and port price block, owner block, tags, CTA copy. |
| **Booking flow** | Modal "הזמנת השכרה" → listing page (assumed); Tom keeps create → checkout → Bit. | — | Do not change Tom’s booking or payment flow; only add trust copy and secondary CTA. |
| **Checkout flow** | Not read in MVP. | — | Keep Tom’s checkout and Bit; add "returned from payment" UX if desired. |
| **Post-booking flow** | Pickup/return checklist modals (Dialog); photo upload, condition, deposit/return options. | Modal keeps context; structured steps. | Tom has full pickup/return pages; optional: reuse modal pattern for a compact flow (without changing lifecycle). |
| **Owner listing management** | My Listings with StatusTabs, ListingCard, SummaryStrip, FAB; dashboard with KPICards and charts. | Filter by status; clear metrics. | Add StatusTabs and KPICards to Tom’s owner page. |
| **Trust verification flow** | Verified badge on owner; trust score in profile; KYC not in read MVP. | — | Tom already has KYC; add verified/trust display where it fits. |
| **Post-rental review** | ReviewModal: rate user, optional text, submit; toast. | Focused dialog; clear success. | Tom has LeaveReviewForm inline; optional add modal variant. |
| **Messaging/support** | "צ'אט" from modal; "שאל שאלה לבעל הפריט" under CTA; help/FAQ/support pages. | Short path to contact and help. | Keep Tom’s messaging; add FAQ structure and support links. |

---

## 5. TRUST + MARKETPLACE UX INSIGHTS

| Pattern | Where | Portable idea |
|--------|--------|----------------|
| **Identity indicators** | OwnerSection: verified badge (CheckCircle2); avatar + name. | Show "מאומת" (or equivalent) next to owner when KYC approved. |
| **Owner credibility** | "בעלים • X השכרות"; star rating; "Show more from owner". | Tom already has owner + reviews; add rental count if available. |
| **Response time** | Not in read files. | Optional later. |
| **Booking confidence copy** | Sticky CTA footer: "ביטול חינם", "תמיכה 24/7", "כולל ביטוח לציוד". | Add short trust line under checkout/booking CTA (e.g. deposit refund, support). |
| **Deposit/payment explanation** | FAQ: deposit what/when/refund; insurance optional; payment at pickup (MVP copy). | Tom uses Bit + manual confirm; port FAQ Q&A and adapt to "תשלום ב-Bit ואישור ידני". |
| **Protection messaging** | Insurance tags (כולל ביטוח, ביטוח בתוספת); Shield in price row. | Keep insurance as optional attribute; show clearly on listing and in summary. |
| **Review credibility** | Star + number + "(X ביקורות)" in listing meta. | Tom already; ensure consistency. |
| **Condition / pickup / return clarity** | Modal: "איסוף והחזרה" section; pickup area, hours, availability; quick features (condition, category, included items). | Tom has pickup note; add structured "pickup & return" block if schema allows. |
| **Safety / verification messaging** | TrustStrip: insured/verified, instant booking, local community. | Use on help or landing; adapt "instant booking" if Tom stays manual confirm. |
| **Friction reduction** | Clear filters; one-tap modal open; sticky CTA; empty state with single CTA. | Apply same patterns without changing flows. |

---

## 6. MODERN UX HIGHLIGHTS

- **Cleaner hierarchy:** Section titles in brand color; consistent card style; one primary CTA per screen.
- **Better microcopy:** "הזמנת השכרה", "שאל שאלה לבעל הפריט", "תרוויחו מהציוד שלכם", "ביטול חינם", "תמיכה 24/7"; short, action-oriented.
- **Stronger CTAs:** Gradient primary buttons; sticky bar; optional floating popup for owners; trust row under CTA.
- **Better cards:** Fixed-height listing cards; soft shadow; badges; motion on tap/hover; skeleton loading.
- **Better browsing:** Horizontal scroll with snap; drag carousel; modal quick view; category chips.
- **Responsive/mobile:** Touch vs scroll detection; swipe on carousel; bottom sheet; single/double calendar by width; safe area.
- **Visual grouping:** Filter card with gradient; price card distinct from body; owner block with avatar and actions.
- **Trust communication:** Badges (insurance, in demand, verified); trust row; FAQ for deposit/insurance.
- **Booking clarity:** Price + minimum days + insurance in one block; "הזמנת השכרה" primary; "שאל שאלה" secondary.

---

## 7. OUTPUT REQUIREMENTS

### A. Structured extraction of useful UI/UX/feature material

Sections 1–6 above: design inventory (layout, hierarchy, hero, cards, categories, filters, trust, pricing, stepper, profile, reviews, status, empty states, CTAs, nav, mobile/RTL, admin); component/UI pattern inventory (cards, chips, badges, carousels, tabs, sticky bars, sheets, accordions, banners, trust blocks, FAQ, step indicators, info rows, stat blocks, skeletons, success/error); feature inventory (listing presentation, search/filter, booking UX, trust, owner/renter tools, availability, profile, messaging/review, dashboards, FAQ/support, conversion); flow inventory (home, browse, listing, booking, post-booking, owner, trust, review, support); trust + marketplace insights; modern UX highlights.

### B. High-value portable ideas

1. **Advanced filters (collapsible):** Price range slider, min rating (stars), date range, insurance toggle, clear filters — reuse in Tom’s search without changing API contract (extend API if needed).
2. **Listing card polish:** Fixed dimensions, soft shadow, insurance/in-demand badges, hover/tap scale, skeleton loading — apply to Tom’s ListingCard.
3. **Sticky CTA + trust row:** Primary "הזמנת השכרה" (or equivalent) + secondary "שאל שאלה" + footer with Shield/Clock/Info (ביטול חינם, תמיכה 24/7, ביטוח) — add to listing detail and/or checkout.
4. **Modal/sheet listing quick view:** Optional: card click opens bottom sheet with carousel, price, owner, CTA; Tom can keep full page as primary.
5. **Category chips:** Gradient pills with icons, link to category, active state, RTL scroll — align with Tom’s categories and routes.
6. **Empty states:** Icon + title + subtitle + single CTA; soft tint and border — use for search no results, no bookings, no listings.
7. **Popular / nearby section:** "השכרות באיזורך" with horizontal cards (and optional drag-snap); loading skeletons — add to home if Tom has geo or simple "recent" query.
8. **Owner dashboard:** StatusTabs (הכל, פעילים, ממתינים, מושהים, בעיות) + KPICards — add to Tom’s owner page.
9. **FAQ structure:** Categories (Security Deposits, Insurance, Bookings, Payments, Account); accordion; adapt copy to Bit + manual confirmation.
10. **TrustStrip / HowItWorks:** 3-column trust or 3-step "how it works" for help or landing — port copy and layout.
11. **LocationInput:** Rotating placeholders, optional geolocation — optional for Tom’s search.
12. **Floating lender CTA:** Timed popup "תרוויחו מהציוד שלכם" — optional for Tom’s home.
13. **IssuesSection:** Amber banner when listing has issues — only if Tom has an "issues" or notes concept.
14. **Review modal:** Dialog with stars + text as alternative to inline form — optional.
15. **Bottom nav polish:** Rounded pill bar, primary fill, active indicator — align with Tom’s nav style.

### C. Do not port blindly

1. **Backend/API:** Do not copy MVP’s listing search API, booking API, or auth; Tom’s APIs and Bit flow are source of truth.
2. **Schema:** Do not add MVP’s Item/Booking/Dispute schema or field names; use Tom’s Prisma models only; port only UI that fits existing fields.
3. **Routing:** MVP uses `[locale]` and `/category/[key]`; Tom uses `(main)` and no locale in path; port only components and copy, not route shape (unless you add category routes in Tom).
4. **Instant booking / payment at pickup:** MVP FAQ says "payment at pickup"; Tom uses Bit redirect + admin confirm — do not introduce instant booking or change payment flow.
5. **Checklist modal vs page:** MVP uses modals for pickup/return checklist; Tom has full pages and a fixed lifecycle — do not replace Tom’s pages with modals unless you keep the same lifecycle and API.
6. **Insurance as filter/attribute:** Port only if Tom’s schema or listing model supports it; otherwise skip or add as optional later.
7. **Trust score number:** MVP profile has trustScore; Tom has KYC + badges — port "verified" and badges, not necessarily a numeric score unless Tom adds it.
8. **next-intl / i18n:** MVP uses next-intl and useTranslations; Tom uses Hebrew inline — port UI structure and copy in Hebrew, not the i18n layer unless Tom adopts it.
9. **Framer Motion:** MVP uses motion heavily; Tom can adopt gradually (e.g. card hover, modal enter/exit) without rewriting everything.
10. **Floating popup timing:** 15s + 5 min repeat is aggressive; if porting, consider longer delay or single show.

### D. Exact references to relevant sections/fragments

- **Hero + filters:** `Lendly MVP\lendly\components\hero-area-with-filters.tsx` (lines 109–323: filter state, LocationInput, CategoryChips, AnimatePresence filter card, price slider, star rating, calendar, insurance switch, search/clear).
- **Home layout:** `Lendly MVP\lendly\app\[locale]\page.tsx` (HeroAreaWithFilters, search results vs PopularRentalsArea, empty state card, FloatingLenderCTAPopup).
- **Listing card:** `Lendly MVP\lendly\components\listing-card.tsx` (props, skeleton, badges, motion, click→modal, touch vs scroll).
- **Listing modal:** `Lendly MVP\lendly\components\listing-modal\ListingModal.tsx` (portal, sheet animation, carousel, price block, quick features, description expand, pickup block, owner card, sticky CTA, "שאל שאלה").
- **Category chips:** `Lendly MVP\lendly\components\category-chips.tsx`, `category-chip.tsx` (gradient, icon, href, active, RTL).
- **Popular carousel:** `Lendly MVP\lendly\components\popular-rentals-area.tsx` (loading skeletons, empty state, drag carousel, RTL, "השכרות באיזורך", see all link).
- **Sticky CTA:** `Lendly MVP\lendly\components\listing-modal\StickyCTA.tsx` (trust row: Shield, Clock, Info); same file and ListingModal for primary/secondary buttons.
- **PriceBox:** `Lendly MVP\lendly\components\listing-modal\PriceBox.tsx` (gradient card, price, insurance line).
- **OwnerSection:** `Lendly MVP\lendly\components\listing-modal\OwnerSection.tsx` (avatar, verified badge, "Show more").
- **Empty state:** `Lendly MVP\lendly\components\common\EmptyState.tsx`; search empty in `page.tsx` (Search icon, noResults, filterHelperText); popular empty in `popular-rentals-area.tsx` (MapPin, noNearbyListings, viewAllListings).
- **Floating popup:** `Lendly MVP\lendly\components\floating-lender-cta-popup.tsx` (timing, bounce, gradient button, close).
- **Bottom nav:** `Lendly MVP\lendly\components\bottom-nav.tsx` (items, active indicator, primary bar).
- **StatusTabs:** `Lendly MVP\lendly\components\lender\StatusTabs.tsx` (filters, counts, active style).
- **KPICard:** `Lendly MVP\lendly\components\lender\KPICard.tsx` (title, value, icon, trend).
- **FAQ:** `Lendly MVP\lendly\app\[locale]\help\faq\page.tsx` (categories, accordion, Q&A copy).
- **TrustStrip:** `Lendly\lendly\src\components\home\TrustStrip.tsx` (3 features, icon box, title, description).
- **HowItWorks:** `Lendly\lendly\src\components\home\HowItWorks.tsx` (3 steps, icon, title, description).
- **IssuesSection:** `Lendly MVP\lendly\components\listing-modal\IssuesSection.tsx` (amber banner, issue count, "למידע נוסף").
- **LocationInput:** `Lendly MVP\lendly\components\location-input.tsx` (placeholders, geolocation).
- **Wizard step:** `Lendly MVP\lendly\components\list-item-step-availability.tsx` (sticky header, gradient bg, calendar); `list-item-step-basic-info.tsx` (validation, categories, suggested tags).
- **Review modal:** `Lendly MVP\lendly\components\review-modal.tsx` (dialog, stars, text, submit).
- **Pickup/return modals:** `Lendly MVP\lendly\components\pickup-checklist-modal.tsx`, `return-checklist-modal.tsx` (dialog, photos, condition, deposit/assessment) — reference for structure only; do not replace Tom’s lifecycle.

---

*End of migration reference. No code was implemented; this document is for extraction and planning only.*
