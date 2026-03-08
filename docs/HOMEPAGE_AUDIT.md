# Homepage Audit — Lendly Public Landing (Audit Only)

Focused audit to redesign the public landing experience in a premium, clear, trust-first, Apple-style way. **No code changes in this document.**

**Product rules (for future implementation):**
1. Not signed-in users → marketing homepage experience.
2. Signed-in users → search as true home experience.
3. Every redesign must look polished on mobile/app-style and desktop/laptop.

---

# 1. Homepage routing audit

## Inspected

- `app/page.tsx`
- `app/(main)/home/page.tsx`
- `middleware.ts` (auth/protection)
- `app/layout.tsx`, `app/(main)/layout.tsx`

## Documented

**What `/` currently does:**  
`app/page.tsx` exports a server component that calls `redirect("/home")`. Every request to `/` (signed-in or not) is immediately redirected to `/home`. No auth check at root.

**What `/home` currently does:**  
Rendered by `app/(main)/home/page.tsx`. It is a server component that:
- Calls `getCurrentUser()` from `@/lib/admin` (which re-exports `lib/auth/adapter.ts` → session or dev adapter).
- Renders the same layout for everyone: auth CTA card (only when `!user`), hero, TrustStrip, categories, HowItWorks, discovery CTA, trust/support line.
- No redirect. Both signed-in and signed-out users see the same page structure; only the auth CTA block is conditional.

**Signed-in vs signed-out today:**  
- **Signed out:** Can access `/`, `/home`, `/search`, `/help`, `/signin`, `/onboarding`, `/listing/*` (except `/listing/[id]/manage`). Middleware does not protect `/` or `/home`.
- **Signed in:** Same routes; no special “home” for authenticated users. Bottom nav first item is “חיפוש” → `/search`; there is no “בית” link to `/home`.
- **Differentiation:** Only in the homepage component: `!user` shows the auth CTA card at the top; signed-in users do not see it. No routing difference.

**Safest insertion points to implement the rule later:**

| Rule | Insertion point | Notes |
|------|-----------------|--------|
| Signed out → `/home` | `app/page.tsx` | Keep current `redirect("/home")` when there is no session. Requires reading session in root (e.g. getToken in middleware or getServerSession in a server component). Root page cannot use hooks; use server-side auth. |
| Signed in → `/search` | `app/page.tsx` | Change root so that when user is authenticated (and optionally onboarding complete), redirect to `/search` instead of `/home`. Single place to change behavior. |

**Recommended approach:**  
- In `app/page.tsx`: make it an async server component (or a small wrapper that runs server-side). Call the same auth used by the app (e.g. `getCurrentUser()` from `@/lib/admin` or getSession from NextAuth). If no user → `redirect("/home")`. If user → `redirect("/search")`.  
- No change to `middleware.ts` required for this rule (middleware already allows `/` and `/search`; it only protects specific paths).  
- Optional: add a dedicated route group or layout for “marketing” vs “app” if you later want different shells (e.g. no bottom nav on marketing home).

---

# 2. Current homepage structure

## Inspected

- `app/(main)/home/page.tsx`

## Documented

**Sections in render order:**

| Order | Section | Purpose |
|-------|---------|---------|
| 1 | Auth CTA (conditional) | For unauthenticated users only: short line + “המשך עם Google” → `/signin`. |
| 2 | Hero | Brand (Logo), value prop line (“השכרת ציוד בין אנשים…”), prominent SearchInput. |
| 3 | Trust strip | Three pillars: מאומתים, פיקדון, קהילה (TrustStrip). |
| 4 | Categories | “גלה לפי קטגוריה” + horizontal scroll of category chips linking to `/search?category=…`. |
| 5 | How it works | Three steps: חפשו ציוד, הזמינו ושלמו, איסוף והחזרה (HowItWorks). |
| 6 | Discovery CTA | Card with “גלה ציוד להשכרה”, short copy, primary button “חפשו השכרות” → `/search`. |
| 7 | Trust/support line | Two lines: tagline + help/FAQ links (HOME_HELP_LINKS). |

**Main components used:**  
- `SearchInput` (hero), `Chip` (categories), `Logo`, `Button`, `TrustStrip`, `HowItWorks`, `Link`.  
- No `ListingCard`, no `FAQBlock`, no `EmptyState` on the homepage.

**Static vs data-driven:**  
- **Mostly static.** The only data is `getCurrentUser()` to conditionally show the auth CTA. Categories come from `CATEGORY_LIST` in `lib/constants`. Copy from `lib/copy/help-reassurance` (HOME_HELP_LINKS). No featured listings, no API calls for hero or trust stats.

**Primary CTA(s):**  
- **Signed out:** “המשך עם Google” (auth), then hero search (submit → `/search`), then “חפשו השכרות” (→ `/search`).  
- **Signed in:** Hero search and “חפשו השכרות” only.

**Story arc (top to bottom):**  
Sign in (if needed) → see brand and value prop → search or browse by category → trust (verified, deposit, community) → how it works (search, pay, pickup/return) → final CTA to search. Trust/support at the end. No featured listings, no owner/lender CTA, no FAQ on page.

---

# 3. Homepage component audit

## Inspected

- `components/home/TrustStrip.tsx`
- `components/home/HowItWorks.tsx`
- `components/ui/faq-block.tsx`
- `components/listing-card.tsx`
- `components/search-input.tsx`
- `components/ui/chips.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/empty-state.tsx`
- `components/logo.tsx`

## Per-component notes

### TrustStrip — `components/home/TrustStrip.tsx`

- **Purpose:** Three-pillar trust strip (verified, deposit, community) for landing/help.
- **Props:** None.
- **Homepage usage:** Rendered in a section wrapper; no props.
- **Reusability:** Good for any landing or help context; copy is Hebrew and product-specific.
- **Visual:** Three cards, `rounded-xl`, `shadow-soft`, icon in primary/10 circle, small heading + xs text. Uses `grid grid-cols-1 sm:grid-cols-3 gap-4` so it goes 3 columns on sm+.
- **Responsive:** Has sm breakpoint for 3 columns; on mobile stacks. No max-width or desktop-specific spacing; inside AppShell’s max-w-md it stays narrow on desktop.

### HowItWorks — `components/home/HowItWorks.tsx`

- **Purpose:** Three-step “how it works” (search, pay, pickup/return); Tom truth only (Bit, manual confirmation, deposit).
- **Props:** None. Steps are a local constant `STEPS`.
- **Homepage usage:** Rendered in a section; no props.
- **Reusability:** Reusable for landing; steps are hardcoded.
- **Visual:** Section title + three cards; icon in primary/10 circle, “שלב N”, title, description. `grid grid-cols-1 sm:grid-cols-3 gap-6`; `sm:text-right` for alignment.
- **Responsive:** Same as TrustStrip: 3 columns from sm up. No desktop-only layout (e.g. horizontal timeline); on wide screens still a single narrow column inside shell.

### FAQBlock — `components/ui/faq-block.tsx`

- **Purpose:** Accordion FAQ block with optional “more” link. Used on help and listing/booking contexts.
- **Props:** `title`, `items` (question/answer), `moreLink?`, `icon?`, `className?`.
- **Homepage usage:** Not used on the homepage.
- **Reusability:** Good for a “שאלות נפוצות” section on landing; would need a short list of items (e.g. from copy or new constant).
- **Visual:** Card with CardHeader/CardContent, Accordion (Radix), RTL. No responsive overrides.
- **Responsive:** Works in narrow layout; no desktop-specific layout.

### ListingCard — `components/listing-card.tsx`

- **Purpose:** Card for a listing: image, trust badges, title, meta (category, location), price. Links to listing detail.
- **Props:** `title`, `pricePerDay`, `location`, `href`, `imageUrl?`, `category?`, `size?` (default | compact), `trustBadges?`, `className?`.
- **Homepage usage:** Not used on the homepage (no featured/popular section).
- **Reusability:** Ready for a “featured” or “popular” section; needs data from an API (e.g. search or new endpoint). Supports compact size for carousels.
- **Visual:** Rounded card, shadow, 4/3 image, primary price; TrustBadges when provided.
- **Responsive:** `max-w-[180px]` in compact; full width in default. No grid breakpoints inside the component; parent would control grid/list.

### SearchInput — `components/search-input.tsx`

- **Purpose:** Client-side search: input + form submit to `/search` or `/search?q=...`.
- **Props:** `defaultValue?`, `placeholder?`, `className?`, `size?` (md | lg). lg = larger tap target, rounded-xl, shadow-soft.
- **Homepage usage:** Hero; `placeholder="מה מחפשים? ציוד, כלים, מצלמות..."`, `size="lg"`. No `defaultValue`.
- **Reusability:** Good for hero and search page; already used in both.
- **Visual:** Border, focus ring; lg adds padding and rounded-xl. No icon in current implementation (placeholder only).
- **Responsive:** Full width of parent; no breakpoint-specific styling. In hero the parent is `max-w-xl`, so on desktop it stays narrow.

### Chip — `components/ui/chips.tsx`

- **Purpose:** Filter/category pill. Variants: default (border, selectable style), category (gradient teal pill).
- **Props:** `label`, `selected?`, `variant?` (default | category), `className?`.
- **Homepage usage:** Category chips: `variant="category"`, link-wrapped, to `/search?category=...`. Rendered in `flex gap-3 overflow-x-auto` (horizontal scroll).
- **Reusability:** Category variant fits landing; default for filters.
- **Visual:** Category = gradient, white text, shadow, rounded-full. No icon on homepage.
- **Responsive:** Horizontal scroll on all viewports; no grid of chips on desktop. Can feel like “mobile-only” on large screens.

### Button — `components/ui/button.tsx`

- **Purpose:** CVA button; variants include gradient (CTA), default, destructive, outline, etc.
- **Homepage usage:** Auth CTA (“המשך עם Google” gradient), Discovery CTA (“חפשו השכרות” lg gradient).
- **Reusability:** Standard; gradient variant suits primary CTAs.
- **Responsive:** No responsive size; works at all widths.

### Card — `components/ui/card.tsx`

- **Purpose:** Container variants: default, elevated, priceBox.
- **Homepage usage:** Not used directly; inline `rounded-xl border border-border bg-card ... shadow-soft` for auth CTA, discovery CTA, and TrustStrip/HowItWorks internal cards.
- **Reusability:** Could replace inline card classes with Card for consistency.
- **Responsive:** No intrinsic breakpoints.

### EmptyState — `components/ui/empty-state.tsx`

- **Purpose:** Icon, title, optional subtitle, optional CTA (href or onClick). Variants: full (centered block), inline (minimal).
- **Homepage usage:** Not used.
- **Reusability:** Could be used for “no featured listings” or a simple fallback in a future popular section.
- **Responsive:** Centered block; no desktop-specific layout.

### Logo — `components/logo.tsx`

- **Purpose:** Lendly logo (PNG with SVG fallback); optional wordmark, optional link to /home.
- **Props:** `size?`, `showWordmark?`, `linkToHome?`, `className?`.
- **Homepage usage:** Hero h1: `<Logo size={40} />` (no wordmark, no link). Header is in AppShell (Logo with linkToHome).
- **Reusability:** Fine; could add wordmark on desktop for brand clarity.

---

# 4. Homepage data audit

## Documented

**What the homepage currently fetches:**  
- **Only** `getCurrentUser()` from `@/lib/admin` (implemented in `lib/auth/adapter.ts`; uses session or dev adapter). Used only to conditionally render the auth CTA. No listing data, no search, no counts.

**Featured listings:**  
- **None.** The homepage does not load featured, popular, or “near you” listings. No API call from `app/(main)/home/page.tsx`. The discovery CTA is a static card linking to `/search`.

**Categories:**  
- **Hardcoded.** Sourced from `lib/constants.ts`: `CATEGORY_LIST` (slug + labelHe). Used in home page for the category chips. No API or DB.

**Trust stats, counts, reviews, testimonials:**  
- **None on homepage.** No trust stats (e.g. “X השכרות”, “Y משתמשים”), no review counts, no testimonials.
- **Elsewhere in codebase:**  
  - Listing detail and search: `reviewsCount`, `averageRating` (from `app/api/listings/[id]/route.ts`, `app/api/listings/search/route.ts`).  
  - Profile: `reviewsCount`, `averageRating`, `completedBookingsCount` from `app/api/me/route.ts`.  
  - Trust badges: `lib/trust/badges.ts` — `getListingTrustBadges`, `getProfileTrustBadges` (use reviewsCount, KYC, etc.).  
- No global “platform” stats (total listings, total users, total bookings) exposed to the front end for marketing.

**Existing APIs/utilities that could support a richer homepage:**

| Resource | Path / utility | Use for homepage |
|----------|----------------|------------------|
| Listings search | `GET /api/listings/search` (e.g. `?sort=newest&limit=6`) | Featured/recent listings section. |
| Categories | `lib/constants.ts` — `CATEGORY_LIST` | Already used; could add icons or counts if backend supports. |
| Trust badges | `lib/trust/badges.ts` — `getListingTrustBadges` | For any listing cards on homepage (e.g. from search results). |
| Copy | `lib/copy/help-reassurance.ts` — `HOME_HELP_LINKS`, FAQ items | Already used for footer; FAQBlock could use PAYMENT_FAQ_ITEMS or a short subset. |
| Me (signed-in) | `GET /api/me` | If root redirects signed-in to search, optional for “your city” or personalized section. |

**Exact file paths:**

- Homepage data: `app/(main)/home/page.tsx` (calls `getCurrentUser` only).  
- Auth: `lib/admin.ts` (re-exports), `lib/auth/adapter.ts`.  
- Constants: `lib/constants.ts`.  
- Copy: `lib/copy/help-reassurance.ts`.  
- Listings API: `app/api/listings/search/route.ts`.  
- Listing detail (reviewsCount, etc.): `app/api/listings/[id]/route.ts`.  
- Trust: `lib/trust/badges.ts`.  
- Components consuming listing data elsewhere: `app/(main)/search/search-client.tsx`, `app/(main)/listing/[id]/page.tsx`.

---

# 5. Responsive layout audit

## Inspected

- `app/(main)/layout.tsx`
- `components/app-shell.tsx`
- `app/globals.css`
- `app/(main)/home/page.tsx` and child components (TrustStrip, HowItWorks, etc.)

## Documented

**Max width / container patterns:**  
- **AppShell:** Inner content wrapper is `w-full max-w-md` (~448px). All main content (including homepage) is inside this; on desktop the whole app is a narrow centered column.  
- **Homepage:** Outer wrapper is `min-h-screen pb-6` with no max-width. Hero inner content has `max-w-xl` (~576px) for the block containing logo, text, and search. No other section has its own max-width; they span the full shell width (so effectively max-w-md).  
- **globals.css:** No `.container` or responsive container class; no breakpoint-based max-widths.

**Page padding patterns:**  
- **AppShell:** `main` has `px-4 pt-5`. So all pages get 1rem horizontal padding.  
- **Homepage:** Sections use `pt-8` or `pt-10`; hero has `pb-10 pt-6 px-0` (hero content has no extra horizontal padding; it uses the main’s px-4).  
- **Bottom:** `pb-6` on homepage root; AppShell has `pb-24` for bottom nav.

**Mobile spacing patterns:**  
- Section spacing: `pt-8` (TrustStrip, categories, HowItWorks, discovery CTA), `pt-10` (trust/support line).  
- Gaps: `space-y-5` in hero; `gap-3` for category chips; `gap-4` in TrustStrip; `gap-6` in HowItWorks.  
- No mobile-specific overrides (e.g. tighter spacing on small screens).

**Desktop spacing patterns:**  
- No desktop-specific spacing. Same `pt-8`/`pt-10` and gaps at all breakpoints. TrustStrip and HowItWorks use `sm:grid-cols-3` but remain inside max-w-md, so “desktop” is just the same narrow column with 3-column grids.

**Does the homepage feel intentionally designed for desktop?**  
- **No.** It feels like a mobile layout inside a fixed narrow shell. No responsive typography (e.g. larger hero on lg), no multi-column section layout (e.g. hero + categories side by side), no max-width for readability on wide screens, no use of horizontal space. On a laptop/desktop the experience is “narrow mobile stack” with no visual hierarchy tuned for width.

**Where grids/columns should likely be introduced in a redesign:**  
- Hero: consider two columns on md+ (e.g. headline + value prop left, search + primary CTA right).  
- Trust strip: already 3 columns at sm; on desktop could sit in a wider container with more breathing room.  
- Categories: on desktop, consider a grid of chips instead of horizontal scroll, or a 2-row layout.  
- How it works: could be a horizontal timeline or 3 columns in a wider band.  
- Featured listings: grid (e.g. 2–4 columns) on desktop, carousel or 2 columns on mobile.  
- Footer/trust line: could sit in a wider full-bleed strip with internal max-width.

**Does the current AppShell help or limit a premium landing page?**  
- **Limits.** `max-w-md` is app-style (fits list/detail views) but makes the marketing homepage feel locked to phone width. A premium landing often wants: (1) optional full-bleed hero or wider hero container on desktop, (2) different padding or max-width for the marketing root vs app pages, or (3) a separate “marketing” layout without the bottom nav and with a different header. Currently the same shell wraps everything, so the landing cannot “break out” for a more editorial, desktop-first hero.

---

# 6. Desktop weakness audit

| # | Route/File | Affected component / area | What feels weak | Why it hurts desktop polish | Severity |
|---|------------|---------------------------|------------------|-----------------------------|----------|
| 1 | `app/(main)/home/page.tsx` | Whole page container | Single narrow column (max-w-md from shell); no breakout | Entire page is a ~448px band; no use of width for hierarchy or rhythm | **High** |
| 2 | `app/(main)/home/page.tsx` | Hero section | Hero content max-w-xl; no two-column or larger typography on lg | Hero stays small and single-column; no “billboard” impact on desktop | **High** |
| 3 | `app/(main)/home/page.tsx` | Category strip | Horizontal scroll only; no grid or wrap on desktop | Chips in a single row feel mobile-only; wasted space and no clear discovery | **Medium** |
| 4 | `components/home/TrustStrip.tsx` | Trust cards | Same card size and density at all widths; inside max-w-md | Trust feels small and repetitive; no visual anchor or spacing for desktop | **Medium** |
| 5 | `components/home/HowItWorks.tsx` | Steps | 3 columns but within narrow shell; no timeline or visual flow on wide | Steps don’t feel like a journey; could use horizontal line or larger type on desktop | **Medium** |
| 6 | `app/(main)/home/page.tsx` | Discovery CTA card | Single full-width card; no side-by-side or emphasis on desktop | CTA doesn’t stand out as the main action in a wider layout | **Medium** |
| 7 | `app/(main)/home/page.tsx` | Trust/support line | Small text (text-xs), centered; no structure | Footer feels lost; no clear separation or multi-column links on desktop | **Low** |
| 8 | `components/app-shell.tsx` | Shell wrapper | max-w-md for all content | Shell enforces narrow layout for landing and app alike; limits premium landing feel | **High** |
| 9 | `app/(main)/home/page.tsx` | Section transitions | Uniform pt-8; no visual separation (e.g. background, rule, or spacing scale) | Page reads as one long stack; no rhythm or “chapters” on large screens | **Low** |

---

# 7. Mobile weakness audit

| # | Route/File | Affected component / area | What feels weak | Why it hurts mobile UX | Severity |
|---|------------|---------------------------|------------------|-------------------------|----------|
| 1 | `app/(main)/home/page.tsx` | First screen (above fold) | Auth CTA (when shown) + hero; value prop is one short line | Unclear in 2–3 seconds what the product is (rental marketplace); could be stronger headline or visual | **Medium** |
| 2 | `app/(main)/home/page.tsx` | Hero | No search icon in SearchInput; placeholder only | Slightly less clear that the main action is search; icon could reinforce | **Low** |
| 3 | `app/(main)/home/page.tsx` | Trust strip | Three cards with similar weight; no single “hero” trust message | Trust is important for conversion but doesn’t pop; could lead with one line or badge | **Medium** |
| 4 | `app/(main)/home/page.tsx` | Categories | Horizontal scroll with no “see all” or count | User doesn’t know how many categories or that they can scroll; scrollbar hidden | **Low** |
| 5 | `app/(main)/home/page.tsx` | How it works | Three steps with same visual weight | Scanability could be improved (e.g. step numbers more prominent, or one primary step) | **Low** |
| 6 | `app/(main)/home/page.tsx` | Discovery CTA | One primary button; no secondary “השכירו” or owner CTA | Renters get one path; owners have no clear entry from homepage | **Medium** |
| 7 | `app/(main)/home/page.tsx` | Trust/support line | Small text; two lines with links | Easy to miss; could be one clear line + one link row for scanability | **Low** |
| 8 | `app/(main)/home/page.tsx` | Overall | No featured listings or “proof” | No social proof or concrete examples above the fold; trust is abstract only | **Medium** |

---

# 8. Missing homepage sections

| Missing or weak | Build new or upgrade? | Likely files to touch |
|-----------------|------------------------|------------------------|
| **Hero clarity** | Upgrade | `app/(main)/home/page.tsx`: stronger headline, optional subline, search + primary CTA; consider `components/home/HeroSection.tsx` or inline. |
| **Trust explanation** | Upgrade | Existing TrustStrip; add one-liner above or a single “why Lendly” line. Optional: reuse trust copy from `lib/copy/help-reassurance.ts`. |
| **Category discovery** | Upgrade | Same page; category strip could become grid on desktop, add icons if constants support. |
| **How it works** | Upgrade | HowItWorks; optional numbering or timeline; consider compact variant for mobile. |
| **Featured listings / marketplace proof** | Build new | New section + data: call `GET /api/listings/search` (e.g. newest 6) or new endpoint; use `ListingCard`; `components/home/FeaturedListings.tsx` or similar; loading/empty from `LoadingBlock`/`EmptyState`. |
| **Owner value proposition** | Build new | Section + CTA “השכירו את הציוד שלכם” or similar → `/signin` or `/add` (with auth). New copy; optional `components/home/OwnerCTA.tsx`. |
| **FAQ** | Upgrade / add | Use existing `FAQBlock` + short FAQ list (e.g. 3–4 from `lib/copy/help-reassurance.ts` or new `HOME_FAQ_ITEMS`). Section in `home/page.tsx`. |
| **Final CTA** | Upgrade | Current discovery CTA could be duplicated or restyled at bottom; add owner CTA next to it for two paths. |

---

# 9. Best homepage redesign architecture

Proposed section-by-section plan for a **premium, responsive** marketing homepage (signed-out users). Order and intent:

| Order | Section | Purpose | Reused components | New / upgraded | Desktop layout note | Mobile layout note |
|-------|---------|---------|-------------------|----------------|--------------------|--------------------|
| 1 | **Hero** | Immediate value prop + search + primary CTA | SearchInput, Logo, Button | HeroSection or upgraded hero block; optional wordmark on desktop | Two-column possible (copy left, search/CTA right); larger type; max-width container (e.g. max-w-4xl) | Single column; logo, one line, search, CTA; tight spacing |
| 2 | **Trust one-liner** | Single line “מאומתים, פיקדון, קהילה” or badge row | — | Short trust strip (text or small badges) | Centered or left-aligned in hero band | Below hero, one line |
| 3 | **Categories** | Discovery by category | Chip (category variant), Link | Optional CategoryStrip with icons; grid on desktop | Grid 2–3 rows or wrapped chips; max-width container | Horizontal scroll with visible “more”; optional section title |
| 4 | **Trust strip** | Three pillars (verified, deposit, community) | TrustStrip | Optional spacing/typography upgrade; optional “trust” section wrapper | 3 columns in wider container; more padding; optional background tint | Stack; same or tighter cards |
| 5 | **How it works** | Three steps | HowItWorks | Optional timeline or step numbers; optional compact variant | 3 columns with optional connector line; larger step labels | Stack; numbered steps |
| 6 | **Featured / popular listings** | Real marketplace proof | ListingCard, LoadingBlock, EmptyState | FeaturedListings section; fetch from search API (e.g. newest 6); skeleton state | 2–4 column grid; “ראה הכל” → /search | Horizontal scroll or 2 columns; same |
| 7 | **Owner CTA** | “השכירו את הציוד שלכם” | Button | OwnerCTA section; copy + CTA to signin/add | Half-width or card beside renter CTA; or full-width band | Card with one CTA |
| 8 | **FAQ** | 3–4 questions | FAQBlock | HOME_FAQ_ITEMS in copy; section wrapper | Accordion in max-width container; optional 2-column if many items | Single column accordion |
| 9 | **Final CTA + support** | Primary “חפשו השכרות” + help links | Button, Link | Optional two CTAs (search + list item); reuse HOME_HELP_LINKS | One row: primary CTA + secondary + help links | Stack: CTA then links |

**Goals:** Clear marketplace explanation in seconds; strong trust (one-liner + strip); real category discovery; real listings proof; owner motivation; clean CTA flow (search + list).

---

# 10. Safest implementation plan

| # | Item | Order | Likely files to change | Why this order | Risk |
|---|------|-------|------------------------|----------------|------|
| 1 | **Routing: signed-out → /home, signed-in → /search** | 1 | `app/page.tsx` (async, getCurrentUser, conditional redirect) | Establishes correct entry for each user before changing content; small change. | Low |
| 2 | **Responsive shell or landing container** | 2 | `app/(main)/layout.tsx` and/or `components/app-shell.tsx`; optional `(marketing)/layout.tsx` with different max-width for home | Allows homepage to use more width on desktop without breaking app pages. | Medium |
| 3 | **Hero upgrade (typography, optional two-column desktop)** | 3 | `app/(main)/home/page.tsx`; optional `components/home/HeroSection.tsx` | Biggest visual impact; reuse existing SearchInput and Logo. | Low |
| 4 | **Trust one-liner + TrustStrip spacing** | 4 | `app/(main)/home/page.tsx`; `components/home/TrustStrip.tsx` (optional) | Improves trust without new data; small copy/layout. | Low |
| 5 | **Categories: desktop grid + optional icons** | 5 | `app/(main)/home/page.tsx`; `lib/constants.ts` if adding icon keys | Better discovery on desktop; constants change optional. | Low |
| 6 | **Featured listings section (API + ListingCard)** | 6 | `app/(main)/home/page.tsx` (fetch or client section); optional `components/home/FeaturedListings.tsx`; `app/api/listings/search/route.ts` (already supports limit/sort) | Adds proof; read-only API; loading/empty states. | Medium |
| 7 | **Owner CTA section** | 7 | `app/(main)/home/page.tsx`; optional `components/home/OwnerCTA.tsx`; copy | New section; no API; links to signin/add. | Low |
| 8 | **FAQ block on homepage** | 8 | `app/(main)/home/page.tsx`; `lib/copy/help-reassurance.ts` (e.g. HOME_FAQ_ITEMS); `components/ui/faq-block.tsx` (reuse) | Reuse FAQBlock; copy only. | Low |

**Why this order:** Routing first so both experiences are correct. Then layout/shell so the rest of the work has the right canvas. Hero and trust are quick wins. Categories and featured listings add substance. Owner CTA and FAQ complete the story. Each step is independently shippable.

---

# 11. Open questions

1. **Shell vs marketing layout:** Should the marketing homepage stay inside the current AppShell (header + bottom nav) or use a separate layout (e.g. no bottom nav, different header) for a more “landing” feel? Codebase has no separate marketing layout today.

2. **Featured listings source:** Use existing `GET /api/listings/search?sort=newest&limit=6` from the server component, or add a dedicated “featured” or “popular” endpoint (e.g. by city, by listing count)? Current search has no “featured” flag; “newest” is the only simple option without new logic.

3. **Categories with icons:** `CATEGORY_LIST` has slug + labelHe only. Adding icons would require new assets or icon keys in constants and possibly in Chip/UI; no current pattern for category icons in the codebase.

4. **RTL and desktop two-column hero:** Right-to-left may affect “copy left / search right” vs “copy right / search left”; need to confirm desired order and test RTL with a two-column hero.

5. **Auth CTA placement for signed-out:** Current auth CTA is the first block. After redesign, should it stay at top, move below hero, or become a subtle header-only link? Product rule says “marketing homepage” for signed-out; clarity of “sign in” vs “browse” may need a decision.

6. **“See all” for categories:** If categories become a grid on desktop, should there be a “כל הקטגוריות” or “ראה הכל” that links to `/search`? No such link today.

---

*End of homepage audit. No code was changed. Use this document to plan and implement the redesign.*
