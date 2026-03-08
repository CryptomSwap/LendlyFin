# Desktop Layout Audit — Lendly Shell and Layout System

Audit-only document to make the platform feel like a proper website on desktop while preserving mobile app-style experience. **No code changes.**

**Design rule:** The platform must work well in both mobile/app-style layout and desktop/laptop full-screen layout. On desktop it should feel like a normal website, not a narrow phone UI centered on the screen.

---

# 1. Shell architecture audit

## Inspected

- `app/(main)/layout.tsx`
- `components/app-shell.tsx`
- `components/bottom-nav.tsx`
- `components/auth-header-link.tsx`
- `components/admin-nav.tsx`
- `app/layout.tsx`
- `app/globals.css`

## Documented

**How the global shell works today**

- **Root:** `app/layout.tsx` wraps the app in `<html lang="he" dir="rtl">`, Heebo font variable, `<body>` with `min-h-screen bg-background text-foreground font-sans antialiased`, and `SessionProvider`. No shell or max-width here.
- **Main app:** `app/(main)/layout.tsx` renders a single child: `<AppShell>{children}</AppShell>`. Every page under `(main)` (home, search, listing, add, bookings, profile, help, admin) goes through this one shell. There is no route-specific layout (e.g. no separate layout for admin or marketing).
- **AppShell** (`components/app-shell.tsx`):
  - Outer: `min-h-screen bg-background flex justify-center` — full viewport, content centered.
  - Inner: `w-full max-w-md bg-card min-h-screen pb-24` — **this is the only content column**. All main content lives inside a fixed **448px** (Tailwind `max-w-md`) wide band. On viewports wider than 448px, the rest is background.
  - **Header:** Sticky, `px-4 py-3`, flex row: `AuthHeaderLink` (left in RTL), `Logo` (center), spacer (right). No breakpoint-based behavior; same on all sizes.
  - **Main:** `px-4 pt-5 flex-1` — horizontal padding 1rem, top padding 1.25rem. No max-width; width is inherited from the parent `max-w-md`.
  - **Bottom nav:** Rendered as sibling to main; fixed to bottom (see below).

**Where max-width is enforced**

- **AppShell inner div:** `max-w-md` (~448px). This is the single choke point: every page’s content is limited to this width regardless of viewport.
- **Bottom nav inner:** `max-w-md mx-auto` — bar is centered and also capped at 448px so it aligns with the content column. Nav itself is `fixed bottom-0 inset-x-0` (full width), but the clickable area is max-w-md.
- **StickyCTA** (`components/ui/sticky-cta.tsx`): `max-w-md mx-auto` so the sticky CTA bar aligns with the content column.

**Where page padding is enforced**

- **Shell:** Only in `main`: `px-4 pt-5`. So every page gets 16px horizontal padding and 20px top. No responsive padding (e.g. no `md:px-6`).
- **Individual pages** add their own spacing (e.g. `space-y-6`, `pb-24`, `pb-28`) but do not override the shell’s padding. Some pages use `-mx-4` to break out of padding for full-bleed sections (e.g. listing detail carousel).

**How header and bottom nav are applied**

- **Header:** Always visible, sticky top, inside the max-w-md column. Contains auth link, logo, and dev impersonation. Same for all routes including admin; admin pages add `AdminNav` in page content below the header, not in the shell.
- **Bottom nav:** Always visible, `fixed bottom-0 inset-x-0 z-50`, with inner `max-w-md mx-auto`. Four items: חיפוש, הזמנות, עזרה, פרופיל. No conditional visibility by route or viewport; no desktop-specific nav.

**Which shell decisions are mobile-first only**

- **Single column max-w-md:** Chosen for phone-first layout; no wider option for desktop.
- **Fixed bottom nav:** Pattern for mobile apps; no consideration for desktop (e.g. moving to top or sidebar).
- **No responsive shell:** Same structure at all breakpoints; no `md:` or `lg:` classes in AppShell.
- **No container utilities in globals.css:** No `.container` or responsive max-width classes; pages rely on the shell’s single column.

**Which shell choices currently prevent a proper desktop website feel**

- **max-w-md on the only content wrapper:** On desktop the entire app is a narrow vertical strip. No multi-column pages, no wider reading width, no “full-width” sections (e.g. hero, tables) that use viewport width.
- **Single shell for all routes:** Marketing home, app pages, and admin share the same 448px column. Admin (tables, filters, metrics) and marketing (hero, featured listings) would both benefit from more width, but cannot get it without changing the shell or adding route-specific layouts.
- **Bottom nav always visible:** On desktop, bottom nav is redundant with a top nav and consumes vertical space without adding a “website” feel.
- **No top nav expansion on desktop:** Header stays minimal (auth + logo). There is no place for primary nav links, breadcrumbs, or admin sidebar on large screens.

---

# 2. Container and width audit

| File path | Class names / pattern | Where used | Good for mobile | Good for desktop |
|-----------|------------------------|------------|------------------|------------------|
| `components/app-shell.tsx` | `w-full max-w-md` on content wrapper | All (main) pages | Yes | No — locks entire app to 448px |
| `components/bottom-nav.tsx` | `max-w-md mx-auto` on nav bar inner | Bottom nav | Yes | Aligns with shell but reinforces narrow feel |
| `components/ui/sticky-cta.tsx` | `max-w-md mx-auto` | Booking detail, etc. | Yes | Same narrow band |
| `app/(main)/home/page.tsx` | `max-w-md mx-auto` on one subtitle | Final CTA card text | N/A | N/A (text only) |
| `components/home/HeroSection.tsx` | `max-w-xl` on hero copy block | Hero text | Yes | Still narrow; hero can’t use full width |
| `components/home/OwnerCTA.tsx` | `max-w-xl mx-auto` | Owner CTA section | Yes | Constrained by parent max-w-md |
| `app/(main)/signin/page.tsx` | `max-w-md mx-auto` | Sign-in form wrapper | Yes | Fine for form |
| `app/(main)/onboarding/page.tsx` | `max-w-md mx-auto` | Onboarding form | Yes | Fine for form |
| `app/(main)/search/page.tsx` | `max-w-md` on subtitle only | Search page header | N/A | N/A |
| `app/(main)/help/*.tsx` (faq, getting-started, safety, insurance-terms) | `max-w-4xl mx-auto` | Help content | Yes | Good — but content is still inside shell’s max-w-md, so 4xl never takes effect on viewport |
| `components/listings/BlockDateRangeDialog.tsx` | `max-w-sm` | Modal/dialog | Yes | Yes |
| `components/listing-card.tsx` | `max-w-[180px]` (compact), `w-full` (default) | Cards in grids | Yes | Grid parent is still narrow |
| `components/ui/empty-state.tsx` | `max-w-sm mx-auto` on subtitle | Empty state text | Yes | Fine |
| `app/(main)/admin/disputes/[id]/resolve-form.tsx` | `max-w-md w-full` | Form | Yes | Form could be wider in admin |
| `app/(main)/admin/users/[id]/suspend-actions.tsx` | `max-w-xs` on input | Inline input | Yes | Yes |

**Summary**

- **Primary constraint:** AppShell’s `max-w-md` applies to the whole app. Any inner `max-w-4xl` (e.g. help pages) is effectively capped by the parent, so desktop never gets a wider content area.
- **Page wrappers:** No page defines its own outer max-width; they all inherit the shell. Most use `space-y-6` or similar and `dir="rtl"` with no width override.
- **Section wrappers:** Home and a few components use `max-w-xl` or `max-w-md` for inner copy; these stay narrow and don’t create a “wider section” on desktop.
- **Cards:** Cards stretch to full width of the shell column; on desktop that’s still 448px minus padding. No card or grid is designed to span a wider column.
- **Grids:** Search results use `grid-cols-1 sm:grid-cols-2`; homepage featured uses `sm:grid-cols-2 lg:grid-cols-3`. These scale within the shell only, so on desktop they remain 2–3 narrow columns inside 448px.

---

# 3. Navigation audit

**Header behavior**

- **Location:** Inside AppShell, sticky top, full width of the max-w-md column.
- **Content:** Auth link (התחברות / פרופיל), Logo (links to /home), spacer. Plus DevImpersonationSwitcher below when present.
- **Breakpoints:** None. Same layout and density on all viewports. No extra nav links, breadcrumbs, or search on desktop.

**Bottom nav behavior**

- **Location:** `fixed bottom-0 inset-x-0`; inner content `max-w-md mx-auto` with safe-area padding.
- **Items:** חיפוש (/search), הזמנות (/bookings), עזרה (/help), פרופיל (/profile). Active state by pathname prefix.
- **Visibility:** Always rendered; no `hidden md:flex` or equivalent. No route-based hide (e.g. on admin or signin).

**Should bottom nav remain visible on desktop?**

- **Current:** Yes, and it is the only global nav. On desktop this is app-like (bottom bar) rather than website-like (top nav or sidebar). It also uses vertical space and can feel redundant if a top nav is added.
- **Recommendation:** For a “proper website” feel, bottom nav should be hidden or replaced on desktop (e.g. `hidden md:block` for a top nav that shows the same links, or move primary links into the header at `md:`).

**Admin navigation**

- **Location:** Not in the shell. Each admin page renders `AdminNav` in the page body (below the page title). `AdminNav` is a flex wrap of text links: מדדים, משתמשים, מודעות, הזמנות, מחלוקות, אימות זהות.
- **Visibility:** Same on mobile and desktop. On desktop, a horizontal link row is acceptable but weaker than a sidebar for many admin tasks (tables, filters, detail + list).
- **No admin layout:** Admin routes use the same (main) layout and AppShell; there is no `app/(main)/admin/layout.tsx` with a sidebar or different shell.

**Desktop nav needs**

- **Primary app:** Either a top nav that appears at `md:` with the same four actions (search, bookings, help, profile) and optional home, or a persistent sidebar. Bottom nav can hide at `md:`.
- **Admin:** Stronger pattern: sidebar with the six admin links (and maybe sub-nav per section) so list/detail and tables can use remaining width. Alternatively, keep horizontal AdminNav but give admin pages a wider content area.
- **Marketing (/home):** If home gets a wider layout, it may need its own header (e.g. logo + sign in + primary CTA) without bottom nav; that would be a separate layout or shell variant.

**Where the current system feels too app-like for desktop**

- Entire UI is a single narrow column with a bottom bar — classic mobile app pattern.
- No top-level nav links in the header; primary nav is only at the bottom.
- Admin feels like “another app screen” (same shell, link row) instead of a dashboard with sidebar + content.
- No breadcrumbs or secondary nav for deep flows (e.g. booking detail → messages).

---

# 4. Page-level desktop compatibility audit

| Route | Source file | Current layout pattern | Mobile-only / desktop-compatible | Desktop weakness severity | Likely desktop layout need |
|-------|-------------|------------------------|----------------------------------|----------------------------|----------------------------|
| /home | `app/(main)/home/page.tsx` | Single column; hero, trust, categories, TrustStrip, HowItWorks, featured grid, owner CTA, FAQ, final CTA. All inside shell max-w-md. | Mobile-only: content and grids trapped in 448px; hero and sections can’t use width. | High | Wider single column or two-column hero + sections; optional full-bleed hero. |
| /search | `app/(main)/search/page.tsx` + `search-client.tsx` | Header + client (filters, list/map toggle). List: `grid-cols-1 sm:grid-cols-2`. Map full width of shell. | Mobile-only: grid never exceeds 2 cols; filters and results in narrow column. | High | Wider container; 3–4 column grid for results; filters in sidebar or top bar. |
| /listing/[id] | `app/(main)/listing/[id]/page.tsx` | Carousel -mx-4; then stacked sections (price, description, pickup, rules, CTA). StickyCTA max-w-md. | Mobile-only: single column; gallery and content narrow; sticky CTA aligned to shell. | High | Wider single column or two-column (gallery + details); sticky CTA or sidebar CTA. |
| /add | `app/(main)/add/page.tsx` | Client wizard; steps in single column; Cards per step. No explicit max on form. | Mobile-only: wizard and forms in shell width only. | Medium | Wider single column or two-column (steps nav + step content). |
| /owner | `app/(main)/owner/page.tsx` | Header + sections: OwnerStatsCards (grid-cols-2), quick actions, attention list, upcoming, listings. | Mobile-only: 2-col stats and lists in narrow column. | Medium | Dashboard: sidebar or top nav + wider content; stats in 3–4 col grid; tables/lists use width. |
| /bookings | `app/(main)/bookings/page.tsx` | Header + BookingsListSection (list of booking cards). | Mobile-only: list in shell width. | Medium | Wider single column; list or table with more columns on desktop. |
| /bookings/[id] | `app/(main)/bookings/[id]/page.tsx` | Stacked cards (status, payment, timeline, pickup/return, reviews). StickyCTA at bottom. | Mobile-only: long stack in narrow column; sticky CTA narrow. | Medium | Two-column (main content + sidebar with CTA/summary) or wider single column. |
| /bookings/[id]/messages | `app/(main)/bookings/[id]/messages/page.tsx` + messages-view | Card with message list + input; max-h-[50vh] scroll. | Mobile-only: chat in narrow column; no side-by-side with booking context. | Medium | Two-column: conversation + booking summary/sidebar. |
| /profile | `app/(main)/profile/page.tsx` | Page title + Cards (details, KYC, owner link, admin links). | Works on desktop but cramped; single column. | Low | Wider single column or two-column (profile + activity/settings). |
| /profile/kyc | `app/(main)/profile/kyc/page.tsx` | Title + KYCFlow (steps). | Same as profile; single column. | Low | Wider single column for form. |
| /admin/users | `app/(main)/admin/users/page.tsx` | Title + AdminNav + Card (filters) + AdminUsersTable (overflow-x-auto table). | Mobile-only: table scrolls horizontally; filters wrap; all in narrow column. | High | Sidebar + content; table uses full width; filters in sidebar or top row. |
| /admin/listings | `app/(main)/admin/listings/page.tsx` | Title + AdminNav + status tabs + card grid of listing cards. | Mobile-only: cards in narrow column; horizontal scroll tabs. | High | Sidebar + content; table or denser grid; filters in sidebar. |
| /admin/bookings | `app/(main)/admin/bookings/page.tsx` | Title + AdminNav + Card with list of bookings. | Mobile-only: list in narrow column. | High | Sidebar + list/table; more columns visible. |
| /admin/disputes | `app/(main)/admin/disputes/page.tsx` | Title + AdminNav + filter links + list of dispute cards. | Mobile-only: list in narrow column. | High | Sidebar + list/table; detail in content area. |
| /admin/kyc | `app/(main)/admin/kyc/page.tsx` | Title + AdminNav + AdminKYCReview. | Mobile-only: queue in narrow column. | Medium | Sidebar + wider content for queue and review. |
| /admin/metrics | `app/(main)/admin/metrics/page.tsx` | Title + AdminNav + Cards with metric rows (grid-cols-1 sm:grid-cols-3). | Mobile-only: metrics grids in narrow column. | High | Sidebar + dashboard; metric cards in 2–4 col grid using width. |

---

# 5. Responsive component audit

| Component path | Issue | Upgrade centrally or at page level |
|----------------|--------|------------------------------------|
| `components/app-shell.tsx` | Single max-w-md; no breakpoint. All pages inherit narrow width. | **Centrally:** Shell (or layout) must allow wider content at md/lg, or route-specific layouts. |
| `components/bottom-nav.tsx` | Always visible; no desktop variant. | **Centrally:** Add responsive visibility (e.g. hide at md and show top nav) or pass viewport. |
| `components/ui/sticky-cta.tsx` | max-w-md hardcoded; fixed bottom. On desktop, CTA could be in sidebar or wider bar. | **Centrally:** Accept optional className or responsive max-width; or **page level:** use different CTA placement on desktop. |
| `components/listing-card.tsx` | Compact max-w-[180px]; default w-full. Works in grid but grid parent is narrow. | **Page level:** Grids that use it need wider container; card itself is fine. |
| `components/ui/card.tsx` | No intrinsic width; stretches to parent. | **Page level:** Parent containers determine width. |
| `components/owner/OwnerStatsCards.tsx` | grid-cols-2 only; 6 cards in 2 cols. On desktop, 3 cols would use width better. | **Centrally:** Add sm:grid-cols-3 or md:grid-cols-3. |
| `components/admin-nav.tsx` | Flex wrap links; no sidebar variant. | **Centrally (if admin layout):** Add sidebar variant or use in admin layout; **page level:** keep as-is if admin stays in same shell. |
| `components/bookings/BookingsListSection.tsx` | List of booking cards. Likely vertical stack. | **Page level:** When bookings page gets wider layout, list can be table or multi-column. |
| `app/(main)/admin/users/users-table.tsx` | Table with overflow-x-auto; many columns. | **Page level:** When admin has wider content, table can use full width; consider responsive column visibility. |
| `components/home/TrustStrip.tsx` | grid-cols-1 sm:grid-cols-3; good. | **Page level:** When home has wider container, this will benefit automatically. |
| `components/home/HowItWorks.tsx` | Same. | **Page level:** Same. |
| `components/home/FeaturedListings.tsx` | grid-cols-1 sm:grid-cols-2 lg:grid-cols-3. | **Page level:** Needs wider parent to show 3 cols meaningfully. |
| `components/home/HeroSection.tsx` | md:grid-cols-2 for hero. | **Page level:** Needs wider parent so two columns have room. |
| `components/ui/faq-block.tsx` | Card + accordion; no width. | **Page level.** |
| `app/(main)/search/search-client.tsx` | Filters + list/map; grid sm:grid-cols-2. | **Page level:** When search gets wider container, add lg:grid-cols-3 or 4 and consider filter layout. |

**Summary:** The main architectural fix is **shell/layout** (wider or adaptive container). After that, **bottom nav** and **StickyCTA** are the only central components that need explicit responsive behavior. Most others improve when their parent container is allowed to be wider (page or layout level).

---

# 6. Desktop shell design recommendation

**One adaptive shell vs separate marketing / app / desktop layouts**

- **Recommendation:** Prefer **one adaptive shell** that responds to breakpoint (and optionally route) rather than three separate layout trees. Rationale: (1) Single header/footer/nav logic; (2) RTL and theme already global; (3) Marketing home is under (main) today; (4) Less duplication. Use **breakpoint-based behavior** inside the shell (wider content at md+, different nav at md+) and, if needed, **route-based content width** (e.g. home and search get max-w-4xl, admin gets sidebar + content) via one (main) layout that passes different wrappers or classNames by segment.
- **Alternative:** If home must feel like a distinct marketing site (full-bleed hero, no bottom nav), add a **(marketing)** route group with its own layout that does not use the app shell (or uses a minimal header-only shell). Then (main) stays app shell for /search, /bookings, etc. This is a bigger split; do it only if product demands a fully separate “landing” experience.

**Should bottom nav hide on desktop?**

- **Yes.** At `md:` (768px+), hide the fixed bottom nav and expose the same four actions (חיפוש, הזמנות, עזרה, פרופיל) in the **header** (e.g. horizontal links or a compact nav). This gives a website-style top nav on desktop and keeps mobile unchanged. Implementation: bottom nav `hidden md:hidden` (or `md:hidden`), header gains `md:flex` nav links that link to the same routes.

**Should desktop use a wider content container?**

- **Yes.** On desktop the main content area should not be capped at 448px. Options: (1) **Adaptive max-width:** shell inner div uses `max-w-md md:max-w-4xl` (or `md:max-w-6xl`) so the same shell grows on desktop; (2) **Route-based:** (main) layout renders children in a wrapper that is `max-w-md` by default but `max-w-4xl` (or full width with internal max) for certain segments (e.g. home, search, admin). Prefer (1) for simplicity first; then introduce (2) if home or admin need different widths.

**Should some pages use content max-width while others use full-width sections?**

- **Yes, as a follow-up.** Initially, a single wider max (e.g. max-w-4xl) for the shell is enough. Later: (1) **Home** can use full-bleed hero (negative margin or breakout) with internal max-width for text; (2) **Listing detail** can use full-bleed carousel + max-width for copy; (3) **Admin** can use full width for tables with internal padding. Implement via page-level wrappers or a layout that allows “full width” slots.

**Should admin use a stronger desktop nav pattern?**

- **Yes.** On desktop, admin should use a **sidebar** (vertical nav with the six admin links) so list/detail and tables have horizontal space. Implement: add `app/(main)/admin/layout.tsx` that wraps children in a flex container: sidebar (fixed or sticky) + main content. Sidebar visible at `md:`; on mobile keep current in-page AdminNav or a drawer. This does not require changing the root AppShell; only admin layout changes.

**Cleanest incremental architecture given current codebase**

1. **Phase 1 — Adaptive shell width:** In `app-shell.tsx`, change the inner content div from `max-w-md` to `max-w-md md:max-w-4xl` (or similar). No new layouts; all pages get more width on desktop. Test home, search, listing, profile, one admin page.
2. **Phase 2 — Nav:** Bottom nav `md:hidden`. Header gains a top nav (same four links) visible at `md:flex`. Reuse existing routes; no new components beyond a simple nav link row in the header (or extract from bottom-nav items).
3. **Phase 3 — Sticky CTA:** StickyCTA: at `md:` use `max-w-4xl` or match shell so it doesn’t stay narrow when content is wide; or allow optional “inline” CTA for desktop (e.g. sidebar) on booking detail.
4. **Phase 4 — Admin:** Add `app/(main)/admin/layout.tsx`: sidebar at md+ with AdminNav links, main content area flex-1. Admin pages no longer need to render AdminNav in body; layout provides it. Optional: admin shell uses full width (max-w-none) and only the content area has padding.
5. **Phase 5 (optional):** Home or listing detail break out (full-bleed hero/carousel) with internal max-width for text; or a (marketing) layout for home only.

---

# 7. Best first implementation batch

| # | Item | Files likely to change | Why first | Risk |
|---|------|------------------------|-----------|------|
| 1 | **Adaptive shell max-width** | `components/app-shell.tsx` | Single change; every page gets a wider column on desktop. Validates that existing layouts and grids behave. | Low |
| 2 | **Bottom nav hide on desktop** | `components/bottom-nav.tsx` | Add `md:hidden` so bottom bar disappears at 768px+. Prevents duplicate nav once header nav exists. | Low |
| 3 | **Header nav for desktop** | `components/app-shell.tsx`, optionally a small `components/header-nav.tsx` or inline links | Add the same four links (חיפוש, הזמנות, עזרה, פרופיל) in the header, visible at `md:flex`. Matches bottom nav; no new routes. | Low |
| 4 | **StickyCTA responsive width** | `components/ui/sticky-cta.tsx` | Change `max-w-md` to `max-w-md md:max-w-4xl` (or match shell) so CTA bar widens with content. | Low |
| 5 | **Search results grid** | `app/(main)/search/search-client.tsx` | Add `lg:grid-cols-3` or `lg:grid-cols-4` to the results grid so more cards show per row when shell is wide. | Low |
| 6 | **Admin layout with sidebar** | New: `app/(main)/admin/layout.tsx`; adjust `components/admin-nav.tsx` or new `components/admin-sidebar.tsx` | Sidebar at md+ with admin links; content area flex-1. Admin pages drop in-page AdminNav from title row (or keep as fallback on mobile). | Medium |
| 7 | **Homepage container** | `app/(main)/home/page.tsx` or home components | Optional: add a wrapper with `max-w-4xl mx-auto` for home only so home can opt into a readable width; or rely on Phase 1 shell width. | Low |
| 8 | **Owner dashboard grid** | `components/owner/OwnerStatsCards.tsx` | Add `md:grid-cols-3` so six stats show in 2 rows of 3 on desktop. | Low |

**Why this order:** (1) Shell width unblocks all pages. (2) Nav change improves desktop UX without breaking mobile. (3) Sticky CTA and search grid are quick wins once shell is wide. (4) Admin layout is self-contained and improves the most desktop-heavy flows. (5) Home and owner tweaks polish specific pages.

---

# 8. Open questions

1. **Route-based width vs single adaptive width:** Should home and search get a different max-width (e.g. max-w-5xl) than app pages (max-w-4xl), or should one value apply to the whole (main) tree? Depends on product preference; codebase has no current distinction.

2. **Logo link on desktop:** Logo currently links to /home. For signed-in users, root redirects to /search. Should the logo in the header link to /search when signed in and /home when not? That would require passing auth state into the shell or header; currently the shell does not receive auth.

3. **Admin sidebar persistence:** Should the admin sidebar show “admin” as a single entry in the main app nav (e.g. “מנהל” in header) that expands or links to /admin/metrics, or should admin remain a separate area reached only from profile (admin link)? Affects whether header nav has 4 or 5 items for admins.

4. **Help and signin/onboarding:** Help pages use `max-w-4xl`; signin/onboarding use `max-w-md`. These live under (main) and are currently constrained by the shell. After shell is adaptive, they will get the same wider column unless we add a wrapper. Do we want help to stay “readable” (e.g. max-w-3xl) and signin to stay centered narrow? That would be page-level wrappers.

5. **Listing detail carousel:** Currently `-mx-4` breaks out of padding. If shell gets horizontal padding at md (e.g. md:px-6), should the carousel break out by the same amount (e.g. -mx-6 on md) or should it stay full-bleed to viewport? Affects responsive breakouts.

6. **DevImpersonationSwitcher:** Shown in header for all. Should it be hidden on desktop or in production? Not layout per se but affects header space.

---

*End of desktop layout audit. No code was changed. Use this document to plan the shell and layout refactor.*
