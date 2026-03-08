# Design Migration Plan: Old Lendly → Current Lendly Repo

**Rule:** Current repo (Ledly Tom) is the **product and logic foundation**. This plan describes how to bring over the **visual design, component style, spacing, hierarchy, and UX feel** from the old Lendly repo (Lendly MVP/lendly) **without** copying old architecture or page logic.

**Design requirement (homepage):** Any future homepage redesign must be **intentionally responsive for both mobile and desktop**. The audit (see LENDLY_AUDIT_REPORT.md) should note where the current homepage feels mobile-only, stretched, or under-designed on larger screens so that redesigns address those gaps.

---

## 1. Old Repo Design System Summary

**Source:** `c:\Users\User\Lendly MVP\lendly\`  
**Primary design tokens:** `app/[locale]/globals.css` (and root `app/globals.css` for base)

### 1.1 Color palette

| Token | Light | Dark | Notes |
|-------|--------|------|--------|
| **Primary** | `#50C878` (emerald green) | same | Brand green, CTAs, links, ring |
| **Accent** | `#7C3AED` (violet) | `#8b5cf6` | Secondary actions, highlights |
| **Success** | `#10b981` | same | |
| **Warning** | `#f59e0b` | same | |
| **Danger** | `#ee3f3f` / `#ef4444` | `#ef4444` | Errors, destructive |
| **Background** | `#F8FAFA` (off-white) | `#000000` | Soft tint, not pure white |
| **Foreground** | `#0f172a` (slate-900) | `#f8fafc` | |
| **Card** | `#ffffff` | `#0a0a0a` | |
| **Muted** | `#EAECEC` | `#1e293b` | Subtle surfaces |
| **Border / Input** | `#EAECEC` | `#1a1a1a` | |
| **Ring (focus)** | `#50C878` | same | |

**Semantic colors:** success, warning, danger with foreground pairs. **Slate scale** (50–900) for grays. **Gradients in use:** primary teal/green (`#23B3B2` → `#53D5D4` in category chips and some cards), CTA gradients (`#41B464` → `#00B8B8`), body gradient (green → blue-green → white in `body-gradient.tsx`).

### 1.2 Typography

- **Font:** Heebo (RTL/Hebrew) via `--font-heebo`; Geist Mono for code.
- **Weight:** 300 body, 500–600 headings.
- **Scale (from [locale] globals):**
  - Title/H1: 1.25rem (20px), 600, -0.025em letter-spacing
  - H2: 1.125rem (18px), 600
  - H3: 1rem (16px), 600
  - H4: 0.9375rem (15px), 600
  - Body: 0.9375rem (15px), 300
  - Caption: 0.8125rem (13px), 300, muted color
- **Utility classes:** `.text-title`, `.text-h1`–`.text-h4`, `.text-body`, `.text-caption`.

### 1.3 Spacing rhythm

- **Section:** `.space-section` (3rem top/bottom), `.space-section-sm` (2rem), `.space-section-lg` (4rem).
- **Container:** Responsive max-width (640 → 768 → 1024 → 1280), horizontal padding 1rem (sm: 1.5rem).
- **Component-level:** Consistent 2, 4, 6 spacing; cards use p-2–p-6; listing cards 20px radius, compact padding.

### 1.4 Shadows

- No CSS variables in old repo for shadows; **inline values** in components:
  - Cards: `0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)`
  - Category chip: `0 2px 8px rgba(0,0,0,0.06)`, hover `0 4px 12px rgba(0,0,0,0.08)`
  - Sticky CTA: `0 -8px 24px rgba(0,0,0,0.1)`, button `0 8px 24px rgba(80,200,120,0.3)`
  - Price box: `0 8px 24px rgba(80,200,120,0.15)`

### 1.5 Border radius

- **Cards / modals:** `rounded-[20px]` (20px) common for listing cards and modals.
- **Chips / pills:** `rounded-full`.
- **Buttons:** Often `rounded-2xl` (e.g. StickyCTA), `rounded-md` in base UI button.
- **Inputs:** Typically `rounded-md` or rounded-full for chip-style.

### 1.6 Card styles

- **Listing card:** White bg, border `#E6F3F3`, 20px radius, soft shadow (see above), image 156px (default) or 70px (compact), badges top-left (insurance, in-demand) with primary-color pill.
- **Price box:** `rounded-[20px]`, gradient `from-[#E6F7F0] via-white to-[#F0F9F5]`, border `#50C878/10`, shadow with green tint.
- **Empty state:** White, `rounded-2xl`, `shadow-sm`, centered icon (primary green), gradient CTA button.
- **Admin/metrics:** Standard Card with CardHeader/CardContent; clean grid of metric cards.

### 1.7 Button styles

- **Primary:** Gradient (e.g. `#41B464` → `#00B8B8` or `#50C878` → `#8AE8AC`), white text, rounded-2xl, bold, green-tinted shadow.
- **Category chip:** Gradient (e.g. `#23B3B2` → `#53D5D4`), rounded-full, inner highlight/shine overlay, spring scale animation (hover 1.02, tap 0.92).
- **Base UI button:** CVA variants (default, destructive, outline, secondary, ghost, link), rounded-md, ring on focus.

### 1.8 Form field styles

- **Input:** Border, rounded-md, standard height; primary ring on focus.
- **LocationInput / filters:** Integrated in hero; primary color for focus/active states.
- **Labels:** Block, text-sm font-medium, mb-1/mb-2.

### 1.9 Badges / chips

- **Category chips:** Gradient background, icon + label, rounded-full, shadow, inner gloss, Framer Motion scale.
- **Status badges:** Pill with semantic color (e.g. insurance, in-demand) — small text (9px), white on primary.
- **Empty state CTA:** Gradient primary button, rounded-full, shadow with primary tint.

### 1.10 Nav design

- **Header:** Sticky, white bg, shadow-sm, RTL-aware; back button with primary hover (`rgba(35,179,178,0.1)`); logo/text left/right by direction.
- **Bottom nav:** Not fully read in this pass; old repo has `bottom-nav.tsx` and SidePanel/BurgerButton for mobile.
- **Admin:** Sidebar (admin-sidebar.tsx) + content area; admin guard and clear section headings.

### 1.11 List / grid patterns

- **Listing grid/carousel:** Horizontal scroll, snap; card width 208px (default) or 112px (compact); gap-4; Framer Motion drag and spring animations.
- **Popular rentals:** “קרוב אליך” section with carousel, chevrons, centered pair of cards.

### 1.12 Empty states

- **Component:** `components/common/EmptyState.tsx` — icon (default Package, primary green), title, subtitle, optional CTA with gradient primary button and green shadow.
- **Inline variant:** Simple centered text, py-8.

### 1.13 Section headers

- **Hero:** Search + filters (LocationInput, CategoryChips, date/price/rating); “hero-area-with-filters” — clear hierarchy, primary used for active states.
- **Section titles:** e.g. “קטגוריות”, “קרוב אליך” — text-sm or text-h2, font-medium/semibold.

### 1.14 Page layout patterns

- **Home:** Hero with search + category chips → popular rentals carousel → optional CTA/floating lender CTA.
- **Listing detail:** Full-screen modal (ListingModal) — hero carousel, price box, description (expandable), owner section, sticky CTA at bottom with gradient button.
- **Search:** Hero with filters; results as list or map (old repo has filters; current has list + map).
- **Add listing:** Multi-step wizard; steps with progress bar; cards per step; sticky bottom CTA.
- **Booking detail:** Timeline, status, actions; cards for each section.
- **Admin:** Sidebar + main content; metrics in grid; tables for listings/users/disputes.

### 1.15 Most visually successful pages/screens (old repo)

| Page | Path (old) | Why it works |
|------|------------|---------------|
| **Home** | `[locale]/` with HeroAreaWithFilters + PopularRentalsArea | Clear hero, gradient chips, carousel with motion, primary green accents. |
| **Listing detail** | ListingModal (popup from card) | Full-screen modal, hero carousel, PriceBox gradient card, StickyCTA with gradient button and shadow. |
| **Search** | `[locale]/search` | Same hero + filters; integrated LocationInput and CategoryChips. |
| **Add listing** | `[locale]/listings/new` | 4-step wizard, progress, cards per step (reference for flow; current has 5-step). |
| **Booking detail** | `[locale]/bookings/[id]` | Timeline, status badges, clear sections (booking-detail, booking-drawer). |
| **Profile / dashboard** | Dashboard tabs (owner/renter/messages/settings), lender KPICards, charts. | Tabs, KPI cards, chart components. |
| **Admin** | `[locale]/admin/*` (metrics, listings, users, disputes) | Sidebar, metrics grid, date range, export; clean tables. |

---

## 2. Current Repo Visual Weaknesses

**Source:** `c:\Users\User\Ledly Tom\`

### 2.1 Globals and theme

- **`app/globals.css`:** Already has Lendly radius tokens (`--radius-sm` 8px through `--radius-xl` 28px) and shadow tokens (`--shadow-soft`, `--shadow-medium`). **But** semantic colors are **oklch grayscale** (neutral): primary is near-black, no green or brand color. **Result:** No recognizable brand; “boring” neutral UI.
- **Body:** `layout.tsx` sets `bg-gray-50 text-gray-900` — flat, no gradient or depth.
- **No semantic success/warning/danger** in theme (only destructive); no accent color for secondary actions.
- **Font:** Geist Sans in theme; no Heebo. RTL is set (`direction: rtl`) but typography doesn’t match old repo’s Heebo + weight scale.

### 2.2 Tailwind / theme

- **No tailwind.config** in workspace (Tailwind 4 with `@theme inline` in globals). Theme maps CSS variables; **baseColor in components.json is "neutral"** — reinforces gray.
- **Radius:** Mixed — some components use theme radius (e.g. Card `rounded-xl`), others ad-hoc. No consistent 20px “card” radius like old repo.
- **Shadows:** Only `shadow-soft` and `shadow-medium` used in a few places; no green-tinted or “elevated” shadows for CTAs.

### 2.3 Shared UI components

- **Button:** CVA, default primary = gray (oklch). No gradient variant, no rounded-2xl variant, no primary-green or shadow treatment.
- **Card:** `rounded-xl`, `shadow-sm`, `gap-6`, `py-6` — clean but minimal; no gradient option, no “price box” or “feature” variant.
- **Chip:** Simple: selected = black bg, unselected = white + gray border. **No gradient, no icon, no motion** — much weaker than old category chips.
- **Input:** Standard border/ring; no primary-colored focus in theme (ring uses neutral).
- **StickyCTA:** Bare container (white, border-t, padding). No gradient strip, no shadow, no styled inner button.

### 2.4 Listing card

- **Current:** Link → Card with `shadow-soft`, image in a small wrapper (p-3, h-32), CardHeader/CardContent; no badges, no motion, no 20px radius, no primary-colored price.
- **Missing:** Framer Motion scale on tap/hover, 20px radius, border #E6F3F3, badge pills (insurance, etc.), price in primary color, compact/default sizes, skeleton.

### 2.5 Home page

- **Current:** Simple header “Lendly” + subtitle, SearchInput, “קטגוריות” with Chips, then two **static** Cards (“מצלמת Canon EOS”, “סט מקדחות”) — no real data, no carousel, no hero gradient, no category icons or gradients.
- **Missing:** Hero feel, gradient background or gradient chips, “קרוב אליך” carousel, motion, primary green accents.

### 2.6 Search page

- **Current:** “חיפוש” + SearchClient (list/map, filters in client). **SearchClient** uses ListingCard and ListingsMap — functional but no hero, no integrated LocationInput style, no category chips as in old hero.
- **Missing:** Hero section with search + filters + category chips; same visual language as home.

### 2.7 Listing detail page

- **Current:** Vertical stack: image carousel, title, status badge (Tailwind semantic colors), category, price, description, Rules card, Deposit card, Lender card, reviews line, CTA. **All very flat:** no PriceBox-style gradient card, no sticky CTA with gradient button and shadow, no modal option.
- **Missing:** Price “card” with gradient and green shadow; sticky bottom CTA with gradient primary button; optional modal layout for mobile; expandable description styling.

### 2.8 Add listing wizard

- **Current:** 5 steps, progress bar, Cards per step, sticky bottom button. **Structure is good.** Visually: white header, gray progress bar, standard Card + Input; bottom CTA is default Button (gray primary).
- **Missing:** Primary green progress bar and CTA; optional gradient on key buttons; card styling (e.g. rounded-2xl, soft shadow) to match old wizard feel.

### 2.9 Booking detail page

- **Current:** Cards for status, dates, listing, payment; StickyCTA wraps children. **StickyCTA is minimal;** no gradient bar or green CTA style.
- **Missing:** Timeline visual (if desired from old booking-detail); status chips with semantic colors; sticky CTA with gradient primary button.

### 2.10 Admin

- **Current:** Admin KYC page: title + AdminNav + AdminKYCReview. Other admin pages (bookings, users, disputes, metrics, etc.) exist; layout is simple (space-y-6).
- **Missing:** Admin sidebar layout from old repo; metrics dashboard with KPI cards and date range (current may have metrics page but not inspected in depth); consistent admin shell (sidebar + content).

### 2.11 Nav and shell

- **Current:** AppShell: gray-50 wrapper, max-w-md white content, BottomNav. **No header**, no gradient background, no back button or logo in shell.
- **Missing:** Sticky header (with optional back, logo); body gradient or softer background; bottom nav styling (current BottomNav not fully inspected).

---

## 3. Components / Tokens To Port First

Port **design tokens and small primitives** first so pages can be upgraded systematically.

### 3.1 CSS variables (globals.css)

- **Add to `:root` (and `.dark`):**
  - **Primary green:** `--primary: #50C878` (and primary-foreground white); optionally keep oklch for dark mode or align both to hex.
  - **Accent:** `--accent`, `--accent-foreground` (e.g. #7C3AED / white).
  - **Success / warning:** `--success`, `--success-foreground`, `--warning`, `--warning-foreground` (old repo values).
  - **Muted background:** Softer muted (e.g. #EAECEC light, #1e293b dark) and `--muted-foreground`.
  - **Border/input:** Optional #EAECEC for light to match old “soft” borders.
- **Map in `@theme inline`:** `--color-primary`, `--color-accent`, `--color-success`, `--color-warning` so Tailwind and components can use `bg-primary`, `text-primary`, etc.
- **Optional:** `--radius-card: 20px` for listing cards and large cards; keep existing --radius-sm/md/lg/xl for smaller elements.
- **Shadows:** Add tokens for “card” and “cta”:
  - `--shadow-card: 0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);`
  - `--shadow-cta: 0 8px 24px rgba(80,200,120,0.3);` (or use primary in a custom property)

### 3.2 Typography

- **Font:** Add Heebo (e.g. next/font/google) and `--font-sans: var(--font-heebo)` for RTL; keep Geist as fallback or for LTR if needed.
- **Weights:** Body 300/400, headings 600; document in a small typography section or use utility classes (`.text-body`, `.text-caption`) if you add them to globals.

### 3.3 Button

- **New variants (CVA):**  
  - **Primary gradient:** e.g. `bg-gradient-to-r from-[#41B464] to-[#00B8B8]` (or from CSS vars), `rounded-2xl`, `font-bold`, `shadow-[0_8px_24px_rgba(80,200,120,0.3)]`, hover slightly darker.  
  - **Pill:** `rounded-full` for chip-like or empty state CTA.  
- Keep existing default (then switch default to new primary green when theme is updated), outline, ghost, destructive.

### 3.4 Card

- **Variant or modifier:** “elevated” or “listing”: `rounded-[20px]`, `border border-[#E6F3F3]` (or var), `shadow-card` (new token).  
- **Price-box style:** Optional variant: gradient background `from-[#E6F7F0] via-white to-[#F0F9F5]`, border primary/10, shadow with green tint — for listing detail price block.

### 3.5 Chip / category chip

- **Enhance current Chip or add CategoryChip:**  
  - Support **icon + label**.  
  - **Gradient background** (primary teal or from vars), **rounded-full**, **shadow** (e.g. 0 2px 8px rgba(0,0,0,0.06)).  
  - Optional: inner highlight (pseudo-element or overlay div) for gloss.  
  - Optional: Framer Motion scale on hover/tap (1.02 / 0.92).  
- Keep simple Chip for non-hero use (e.g. filters).

### 3.6 Sticky CTA

- **Wrapper:** Gradient top strip `from-white via-white/98 to-white/95`, border-t (e.g. #E6F3F3), `shadow-[0_-8px_24px_rgba(0,0,0,0.1)]`, padding.  
- **Slot for button:** Prefer gradient primary button (new Button variant) inside.

### 3.7 Empty state

- **Component:** Icon (default primary green), title (text-lg font-semibold), subtitle (text-sm muted), optional CTA with gradient/pill Button.  
- Reuse or create `components/empty-state.tsx` and use on search (no results), bookings, etc.

### 3.8 Badge / status pill

- **Small pills:** For “ביטוח”, “בביקוש”, listing status — rounded-full, small text, white on primary (or semantic colors).  
- Can extend existing Badge or add a small `StatusPill` that uses success/warning/danger/primary.

---

## 4. Pages To Redesign First (in order)

1. **Home** — Hero (search + category chips), “קרוב אליך” carousel with new listing cards; gradient or softer background; primary accents.  
2. **Listing card (shared)** — 20px radius, shadow-card, border, badges, price in primary, optional motion; used on home and search.  
3. **Listing detail** — Price box (gradient card), sticky CTA with gradient button, optional modal-style on small screens.  
4. **Search** — Same hero as home (or compact variant), filters + list/map; reuse ListingCard.  
5. **Add listing wizard** — Progress bar and main CTA in primary green; card styling (rounded-2xl, shadow-soft); keep 5-step logic.  
6. **Booking detail** — Sticky CTA with gradient button; status chips; optional timeline.  
7. **Admin** — Sidebar layout + metrics dashboard (KPI cards, date range); reuse Card and Button variants.

---

## 5. What Can Be Copied Directly vs Rebuilt

| Area | Copy directly | Rebuild using old as reference |
|------|----------------|---------------------------------|
| **Color values** | Hex values for primary, accent, success, warning, danger; slate scale | Map into current CSS variables and Tailwind theme (no file copy). |
| **Shadow values** | Exact pixel values for card, CTA, chip (as tokens) | Apply via tokens/classes in current components. |
| **Typography scale** | Rem sizes and weights (20/18/16/15/13px) | Add Heebo; add utilities or use Tailwind; keep current markup. |
| **Radius (20px cards)** | Use 20px for listing/card surfaces | Add --radius-card or class; apply in Card/listing-card. |
| **Button gradient** | Gradient stops and shadow (e.g. StickyCTA) | New Button variant in current CVA; no copy of old component tree. |
| **Category chip look** | Gradient, rounded-full, shadow, gloss idea | Rebuild CategoryChip (or Chip variant) in current repo; optional Framer Motion. |
| **Listing card look** | Dimensions, border, shadow, badge position, price color | Rebuild ListingCard in current repo; keep current data shape and Link. |
| **Price box** | Gradient and shadow | Card variant or dedicated PriceBox component; use current listing data. |
| **Sticky CTA** | Strip style + button style | Rebuild StickyCTA wrapper + use new Button variant; keep children slot. |
| **Empty state** | Layout and CTA style | New EmptyState component; use current routing and copy. |
| **Hero (search + chips)** | Layout and filter integration idea | Rebuild hero section; use current SearchInput and API; add category chips. |
| **Body gradient** | Gradient stops (green → white) | Optional: add BodyGradient or layout class in current app; no copy of old component. |
| **Admin sidebar** | Layout idea | Rebuild admin layout (sidebar + content) in current app; keep current admin routes and data. |
| **Animations (Framer)** | Scale values (1.02, 0.92, 0.95) | Add where needed in current components; don’t copy old component logic. |

**Do not copy:** Old routing ([locale], next-intl), old API or Prisma schema, old auth, old listing/booking types. **Only** visual tokens, component **styles**, and **layout patterns**.

---

## 6. Recommended Implementation Order

### Phase 0 — Design tokens and fonts (no page logic)

1. **globals.css**  
   - Add primary green (and optionally accent, success, warning) to `:root` and `.dark`.  
   - Add `--shadow-card`, `--shadow-cta` (and map in `@theme inline` if desired).  
   - Add `--radius-card: 20px` and use where needed.  
   - Optionally adjust muted/border to match old repo.

2. **Typography**  
   - Add Heebo (e.g. `next/font/google`), set `--font-sans` for RTL.  
   - Optionally add `.text-body`, `.text-caption` or rely on Tailwind.

3. **Body/layout**  
   - Optionally add a subtle background (e.g. `bg-[#F8FAFA]` or gradient) in root layout or AppShell; or add BodyGradient component later.

### Phase 1 — Shared components (quick wins)

4. **Button**  
   - Add “gradient” (or “primary-gradient”) and “pill” variants; use new primary and shadow-cta.

5. **Card**  
   - Add “elevated” or “listing” variant (20px radius, shadow-card, border).  
   - Optionally add “price-box” variant (gradient bg, green shadow).

6. **Chip / CategoryChip**  
   - Enhance Chip with optional icon and gradient variant, or add CategoryChip; use primary gradient and shadow.

7. **StickyCTA**  
   - Restyle wrapper (gradient strip, border-t, shadow); encourage gradient Button inside.

8. **EmptyState**  
   - New component: icon, title, subtitle, CTA; use primary icon and gradient CTA.

9. **Badge / StatusPill**  
   - Small pill for insurance, status, etc.; primary or semantic colors.

### Phase 2 — Listing and home (high impact)

10. **ListingCard**  
    - Rebuild: 20px radius, shadow-card, border, image ratio, badges (if data exists), price in primary; optional Framer Motion.  
    - Use in Search and Home.

11. **Home page**  
    - Add hero: search + category chips (and optional filters).  
    - Add “קרוב אליך” (or similar) section with carousel/list of ListingCards (real data).  
    - Optional: body gradient or softer background.

12. **Search page**  
    - Reuse hero (or compact variant); keep SearchClient; ensure ListingCard and map match new style.

13. **Listing detail page**  
    - Add price block (PriceBox variant or component); add StickyCTA with gradient Button; optional modal layout for mobile.

### Phase 3 — Wizard, booking, admin

14. **Add listing wizard**  
    - Progress bar and main CTA → primary green; card styling (elevated Card); keep all steps and validation.

15. **Booking detail**  
    - Sticky CTA with gradient button; status chips; optional timeline.

16. **Admin**  
    - Admin shell with sidebar; metrics page with KPI cards and date range; reuse Card/Button.

### Phase 4 — Polish

17. **Nav and shell**  
    - Header (logo, back, user) if missing; bottom nav styling; consistent padding and max-width.

18. **Animations**  
    - Add Framer Motion (or CSS) where it helps (listing card hover/tap, chip tap, modal enter).

19. **Dark mode**  
    - Verify all new tokens and components in dark theme; align with old repo dark values if needed.

---

## 7. Exact Files To Inspect Next

### Current repo (Ledly Tom)

- **Tokens / theme:** `app/globals.css` (already read).  
- **Layout / shell:** `app/layout.tsx`, `app/(main)/layout.tsx`, `components/app-shell.tsx`, `components/bottom-nav.tsx`.  
- **UI primitives:** `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/chips.tsx`, `components/ui/input.tsx`, `components/ui/sticky-cta.tsx`.  
- **Shared feature components:** `components/listing-card.tsx`, `components/listing-image-carousel.tsx`, `components/search-input.tsx`, `components/create-booking-cta.tsx`.  
- **Pages:** `app/(main)/home/page.tsx`, `app/(main)/search/page.tsx`, `app/(main)/search/search-client.tsx`, `app/(main)/listing/[id]/page.tsx`, `app/(main)/add/page.tsx`, `app/(main)/bookings/[id]/page.tsx`, `app/(main)/admin/kyc/page.tsx` (and other admin pages).

### Old repo (Lendly MVP/lendly) — reference only

- **Design tokens:** `app/globals.css`, `app/[locale]/globals.css`.  
- **Hero / home:** `components/hero-area-with-filters.tsx`, `components/category-chips.tsx`, `components/category-chip.tsx`, `components/location-input.tsx`, `components/popular-rentals-area.tsx`.  
- **Listing:** `components/listing-card.tsx`, `components/listing-modal/ListingModal.tsx`, `components/listing-modal/PriceBox.tsx`, `components/listing-modal/StickyCTA.tsx`.  
- **Shared UI:** `components/ui/button.tsx`, `components/ui/card.tsx`, `components/common/EmptyState.tsx`.  
- **Background:** `components/body-gradient.tsx`.  
- **Admin:** `components/admin-sidebar.tsx`, `components/admin-metrics.tsx`, `components/admin-dashboard.tsx`.  
- **Nav:** `components/header.tsx`, `components/header/SignedInHeader.tsx`, `components/bottom-nav.tsx`, `components/nav/SidePanel.tsx`.

---

## 8. Proposed New Shared Design Primitives (current repo)

| Primitive | Purpose |
|-----------|--------|
| **CSS vars: primary, accent, success, warning** | Theming and semantic buttons/badges. |
| **--shadow-card, --shadow-cta, --radius-card** | Consistent cards and CTAs. |
| **Button variant: gradient (primary)** | Sticky CTA, empty state, key actions. |
| **Button variant: pill** | Category chips, secondary CTAs. |
| **Card variant: elevated / listing** | Listing cards, prominent blocks. |
| **Card variant: price-box** | Listing detail price block. |
| **CategoryChip (or Chip gradient)** | Hero categories. |
| **StickyCTA (restyled)** | Listing detail, booking detail. |
| **EmptyState** | No results, empty lists. |
| **StatusPill / Badge** | Insurance, in-demand, booking/listing status. |
| **Optional: BodyGradient** | Subtle gradient behind app shell. |

---

## 9. Quick Wins vs Deeper Redesign

| Quick wins | Deeper redesign |
|------------|------------------|
| Add primary green (and accent) to globals + theme | Full Heebo typography and weight scale |
| Add shadow-card, shadow-cta, radius-card | Home hero + carousel with real data |
| Button gradient + pill variants | Search hero aligned with home |
| Card elevated + price-box variants | Listing detail: PriceBox + StickyCTA + optional modal |
| StickyCTA restyle (strip + slot for gradient button) | Add listing wizard visual pass (progress + cards) |
| EmptyState component | Booking detail timeline + status chips |
| Chip with gradient + icon variant | Admin sidebar + metrics dashboard |
| ListingCard restyle (radius, shadow, border, price color, badges) | Nav/shell (header + bottom nav styling) |
| Optional body bg #F8FAFA or gradient | Framer Motion on cards/chips/modals |

This plan is **read-only**: no code has been changed. Use it to implement the design migration step by step while keeping current repo architecture and business logic intact.
