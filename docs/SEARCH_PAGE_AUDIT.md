# Search Page Audit — Lendly Signed-In Home Experience

Focused audit of the search page as the primary landing experience for signed-in users. **Audit only; no code changes in this document.**

**Product context:**
- Homepage has been significantly improved for desktop and mobile.
- Signed-in users are redirected from `/` to `/search` (see `app/page.tsx`).
- The search page is therefore the most important product surface and should feel like a real marketplace browsing experience on both desktop and mobile.

---

# 1. Search page routing and role

## Inspected

- `app/(main)/search/page.tsx`
- `app/(main)/search/search-client.tsx`
- `app/page.tsx` (root redirect)
- `app/(main)/layout.tsx` (AppShell)
- `middleware.ts` (public paths)

## Documented

**Routing:**
- **Root `/`:** `app/page.tsx` calls `getCurrentUser()`. If user exists → `redirect("/search")`. Else → `redirect("/home")`. So signed-in users always land on `/search`.
- **Search route:** `app/(main)/search/page.tsx` is a server component that renders a static header (“חיפוש” + subtitle) and wraps `<SearchClient />` in `<Suspense>` with a loading fallback. No server-side data fetching; all search state and API calls live in the client.
- **Layout:** Search is under `(main)`, so it uses `AppShell`: sticky header, main content area with `px-4 md:px-8`, `pt-5 md:pt-8`, and bottom nav (mobile). There is no special layout or “hero” treatment for `/search`; `isHomePage` in AppShell is only `pathname === "/home"`, so search gets standard header + padding.

**Role of search now:**
- **Primary signed-in home:** After login or visiting `/`, signed-in users land on `/search`. It is the default “app home” and the main discovery surface.
- **Discovery + filter surface:** Users can search by text (`q`), category, max price, and sort (newest / price). Results are shown as a grid (list view) or on a map. URL is kept in sync (`?q=...&category=...&max=...&sort=...&view=list|map&page=...`).
- **No differentiation from anonymous use:** The same search page is shown to signed-in and signed-out users; there is no “welcome back” or personalized content. The page does not receive or use the current user in the UI (e.g. no “your recent searches” or “listings near you”).

---

# 2. Current search UX structure

## Hero / header area

- **Location:** `app/(main)/search/page.tsx` (server-rendered) and the top of the scrollable content.
- **Structure:** A simple header band: `<header className="mb-6">` with:
  - `h1`: “חיפוש” (text-2xl sm:text-3xl, font-bold).
  - Subtitle: “גלה ציוד להשכרה — חפש לפי קטגוריה, מחיר ומיון” (text-sm, muted, max-w-md).
- **No hero treatment:** No background image, no gradient, no large visual. Compared to the marketing homepage (hero with background image, gradient overlay, headline, search bar, category sidebar on desktop), the search page is a plain title + subtitle. On desktop and mobile it looks like a standard content page, not a “marketplace home.”

## Search input

- **Location:** `search-client.tsx`, first section (“חיפוש”).
- **Implementation:** A single `<input type="search">` with:
  - Search icon (absolute start).
  - Placeholder: “חפש פריט... ציוד, כלים, מצלמות”.
  - Value bound to `q`; `onChange` updates `q` and resets `page` to 1. No explicit submit button.
- **Behavior:** Debounced fetch: `useEffect` with 300 ms delay triggers `fetchResults(page, true)` when `q`, `category`, `min`, `max`, `sort`, or `page` change. So typing updates results in place; URL is updated after a successful fetch via `router.replace`.
- **Difference from homepage:** The homepage hero uses the shared `SearchInput` component (form submit → navigate to `/search?q=...`). The search page uses a raw input and client-side fetch; no shared component, no form semantics.

## Filters

- **Location:** `search-client.tsx`, “סינון ומיון” Card.
- **Controls:**
  1. **Category:** `<select>` with “כל הקטגוריות” + `CATEGORY_LIST`. Value synced to `category`; changing it resets page and triggers fetch.
  2. **Sort:** `<select>` with “הכי חדשים” (newest) and “מחיר נמוך” (price). Value synced to `sort`.
  3. **Max price (₪/day):** Range slider 0–2000 NIS, step 50. Value in `max`; 0 means “no limit.” Label “מחיר מקס׳ (₪/יום)”; current value shown as “ללא הגבלה” or “עד ₪X.”
- **Min price:** Supported in API (`min` query param) but not exposed in the UI (comment: “no min in UI; kept for URL/clear compatibility”).
- **Clear filters:** “נקה סינון” ghost button when any of `q`, `category`, `min`, `max`, or non-default sort is set; clears all and refetches.
- **Layout:** All in one Card; filters are in a 2-column grid (category + sort) plus full-width slider. No responsive variation (e.g. drawer on mobile, sidebar on desktop).

## Sorting

- **Options:** “הכי חדשים” (`newest`, default), “מחיר נמוך” (`price`). Implemented as the sort `<select>` inside the filters Card.
- **API:** `sort=newest` → `orderBy: { createdAt: 'desc' }`; `sort=price` → `orderBy: { pricePerDay: 'asc' }`. No “closest” or “popular” or “rating.”

## Map / list toggle

- **Location:** `search-client.tsx`, “תצוגה” section.
- **UI:** Two buttons in a rounded group: “רשימה” (list) and “מפה” (map). Active state uses `bg-primary text-primary-foreground`; inactive uses muted. Icons: `LayoutList`, `Map`.
- **State:** `view` is `"list" | "map"`; synced to URL via `syncViewToUrl(newView)` so `?view=list` or `?view=map` is persisted.
- **Behavior:** List view shows the results grid + “טען עוד” when `hasMore`. Map view shows `ListingsMap` with the same `items`; map does not have its own loading or empty state beyond the shared `items` (empty search → empty map).

## Result grid / list

- **Location:** `search-client.tsx`, “תוצאות חיפוש” section; only rendered when `view === "list"` and `items.length > 0`.
- **Layout:** Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`. Responsive but same structure on all breakpoints.
- **Cards:** Each result is a `ListingCard` with: title, pricePerDay, location (city), href, imageUrl, category, trustBadges (from owner KYC, phone, completed bookings, reviews). No card-level actions beyond the link.
- **Header:** “תוצאות” (section title) + count (“X פריטים”). When loading more, grid gets `opacity-70 pointer-events-none` and a “טוען עוד...” line below.
- **Pagination:** “טען עוד” button when `hasMore && !loading`; calls `fetchResults(page + 1, false)`. No infinite scroll; no “page N of M.”

## Empty states

- **No results:** When `!loading && !error && items.length === 0` (and list view), `EmptyState` is shown: SearchX icon, “אין תוצאות לחיפוש זה,” subtitle “נסו מילים אחרות או שנו סינון. או הציגו את כל המודעות,” CTA “הצגו את כל המודעות” → `/search`. Variant `full`.
- **Map view with no results:** Same `items`; if empty, the map is still shown with no markers (and no dedicated empty message for the map).

## Loading states

- **Initial load (list view):** When `view === "list" && loading && items.length === 0`, a grid of six `ListingCardSkeleton` in `grid-cols-1 sm:grid-cols-2` is shown. No skeleton for map view.
- **Loading more:** When `loading && items.length > 0`, the existing grid is dimmed and “טוען עוד...” text is shown below; no additional skeletons.
- **Map view loading:** When `view === "map" && !showEmpty`, the map section has `loading && "opacity-70"` and an inline `LoadingBlock` (“טוען...”) below the map.
- **Suspense fallback:** Page-level: `LoadingBlock` “טוען חיפוש...” in a min-height block (used while SearchClient hydrates or lazy-loads).

## Error states

- **API or network error:** When `error` is set, an `Alert variant="error"` is shown: “שגיאה בחיפוש,” the error message, and “נסה שוב” button that calls `fetchResults(1, true)`. Results are cleared on error; list/map then show empty or previous state until retry.

---

# 3. Desktop weaknesses

- **No hero or “home” treatment:** The search page uses a small text header. On desktop, the marketing homepage has a large hero (image, gradient, headline, search, category sidebar). Search feels like a utility page, not the main marketplace home.
- **Narrow content feel:** Content is inside AppShell’s main area with `max-w-md` on the wrapper on small viewports; on `md+` the shell uses `max-w-none` but there is no search-specific max-width or layout that uses the full width for a dashboard-style experience (e.g. filters sidebar + results).
- **Filters are always inline:** The filters Card is a single block above results. There is no desktop-optimized layout such as a sticky sidebar or a compact filter bar; filters take vertical space and don’t scale with wide screens.
- **Header not prominent:** “חיפוש” + one line of subtitle don’t establish search as the app’s primary surface. No trust line, no quick links, no visual hierarchy that matches the improved homepage.
- **Map vs list:** Map and list are toggled in the same flow; there is no split view (e.g. list + small map) or desktop-specific map placement that would support “browse by area” as a first-class pattern.
- **No use of horizontal space:** Single column of content (search bar → categories → filters → view toggle → results). On large screens, categories could be a rail, filters a sidebar, and results a wide grid without feeling stretched.
- **Typography and spacing:** Same spacing and font sizes as mobile; no responsive typography or section spacing tuned for large viewports.

---

# 4. Mobile weaknesses

- **Long scroll to results:** Search input, category chips, full filters Card, view toggle, then results. On small screens this is a lot of chrome before the first listing; filters could be collapsed or in a sheet to get to results faster.
- **Category chips:** Horizontal scroll with `scrollbar-hide`; no indication that more categories exist (no fade or “more”). Chips are links; tapping navigates and refetches. Fine, but the strip could be more discoverable (e.g. label or placement).
- **Filter Card density:** Category dropdown duplicates the category chips; having both chips and a category select can feel redundant. The Card is always open; on mobile a “Filters” button that opens a bottom sheet or modal would reduce scroll and focus attention on results.
- **Map view:** Map height is fixed `h-[60vh] min-h-[280px]`. On mobile, switching to map loses list context; there is no list-on-one-side or bottom sheet of results while viewing the map. Empty map has no specific empty state.
- **“טען עוד”:** Button-based load more is clear but requires a tap; infinite scroll could reduce friction on mobile.
- **No sticky search or filters:** On scroll, search and filters leave the viewport; re-filtering or changing query requires scrolling back up. A sticky search bar or a floating filter chip could help.
- **Touch targets:** Buttons and chips are reasonably sized; the range slider thumb may be small on some devices (custom styling exists but could be checked for a11y).

---

# 5. Discovery weaknesses

- **No category exploration beyond filter:** Categories are either chips (navigate to `?category=slug`) or a dropdown in the filters Card. There is no “browse by category” with imagery or short copy, no segment tabs like on the homepage `DesktopCategoryDiscovery` (e.g. “כל הקטגוריות” / “צילום ומדיה” / “ספורט ופנאי”).
- **No recently viewed:** No “recently viewed” or “continue browsing” section. The product does not store or display recently viewed listing IDs for the current user.
- **No suggested filters:** No “popular in your area,” “often rented with,” or “people also searched for.” Filters are only what the user explicitly sets.
- **No “popular nearby” or location discovery:** API supports `q`, `category`, `min`, `max`, `sort`. There is no geo/location parameter; listings have `city` but search is not filtered by location or distance. No “near me” or “popular in Tel Aviv” type of discovery.
- **No trust indicators at page level:** No strip or line like the homepage (“מאומתים, פיקדון, קהילה”). Trust is only on each listing card (trust badges). For a “signed-in home,” a short reassurance line could reinforce safety.
- **No richer result cards in search:** Cards are the same as elsewhere (image, title, category, location, price, trust badges). No “trending,” “highly rated,” or “new” labels; no quick actions (e.g. save, compare). They are adequate but not “richer” for discovery.
- **No top-of-page guidance:** Header is title + subtitle only. No “מה תרצו להשכיר היום?” or contextual tips, no quick links (e.g. “השכרות פופולריות,” “חדש באתר”), no personalized greeting for signed-in users.

---

# 6. Filtering and sorting weaknesses

- **Redundancy:** Category is both (1) horizontal chips (links) and (2) a select in the filters Card. Two sources of truth can confuse; clearing filters clears category but chips don’t reflect “all” visually until navigation.
- **Limited sort options:** Only “newest” and “price low.” No “price high,” “rating,” “distance” (no geo), or “popular.”
- **Min price absent in UI:** API supports `min`; UI does not expose it. If product requirements need min price, the current UI is incomplete.
- **Filter visibility:** When filters are applied, there is no summary line (e.g. “קטגוריה: צילום · עד ₪500 · מיון: מחיר”). Only “נקה סינון” indicates that filters are on. Users may not remember what is applied.
- **Desktop:** Filters are not in a sidebar or bar; they don’t scale with screen size or support “always visible” filtering while scrolling results.
- **Mobile:** No sheet/modal for filters; the full Card is always in the flow. No “N filters” badge or one-tap clear for individual dimensions.
- **Accessibility:** Selects and slider are native; keyboard and screen reader can use them. The slider’s `aria-valuetext` is set. No explicit `aria-describedby` or live region for “results updated” when filters change.
- **Power and clarity:** For power users, the controls are clear (category, sort, max price, clear). For new users, the combination of chips + Card might feel heavy; a simpler “search + one or two prominent filters” could be clearer, with advanced filters behind “More.”

---

# 7. Result card weaknesses (in search context)

- **Same component, same data:** `ListingCard` is used with the same props as on the homepage and elsewhere. No search-specific variant (e.g. compact list row for “show more on map,” or highlighted “matches your search”).
- **No relevance cues:** No highlight of matching terms in title/category; no “why this result” (e.g. “מתאים לחיפוש שלך”). If text search is extended (e.g. description), relevance cues would help.
- **Grid only:** In list view, only grid layout. No list layout option (e.g. one row per listing with more metadata) for users who want to scan many items quickly.
- **Trust and safety:** Trust badges (identity, phone, bookings, reviews) are on the card and are a strength. No aggregate trust line above the grid (e.g. “כל המודעות ממשכירים מאומתים”).
- **Performance:** Each card has image; grid can have many cards. No explicit lazy-loading or intersection observer in the audit scope; “טען עוד” limits how many load at once.
- **Actions:** Only action is click through to listing. No save/favorite or “compare” in search results; if the product adds these, cards would need to support them.
- **Empty image:** When `imageUrl` is missing or fails, card shows placeholder (ImageIcon). Acceptable; no search-specific treatment.

---

# 8. Best redesign direction

**Position search as the signed-in home:** Make the search page feel like the main marketplace home, not a secondary tool. Align with the improved homepage in tone and structure while keeping search-specific functionality.

**Suggested structure (conceptual):**

1. **Hero / top band (desktop and mobile):**
   - Short, on-brand band (gradient or soft surface, not full-screen hero) with headline that frames search as the main action (e.g. “גלה ציוד להשכרה” or “מה תרצו להשכיר היום?”).
   - Prominent search input (reuse or align with homepage search styling).
   - Optional: one-line trust or reassurance (e.g. “השכרות מאומתות · תמיכה 24/7”).
   - On desktop: consider a compact “hero” that doesn’t compete with the homepage but gives identity (e.g. same blue→mint gradient, no large image).

2. **Category discovery:**
   - Reuse or mirror the homepage category rail (e.g. segments “כל הקטגוריות” / “צילום ומדיה” / “ספורט ופנאי” + chips) so discovery is consistent. On desktop, consider a sidebar or top rail; on mobile, a full-width block below the search band (as on homepage).
   - Single source of truth for category: either chips that update URL and filter state, or one control that drives both; avoid duplicate category select in a separate filters block if chips are primary.

3. **Filters and sort:**
   - **Desktop:** Sticky sidebar or horizontal filter bar (category already in discovery; price range + sort + clear). Results area uses remaining width; grid 3–4 columns.
   - **Mobile:** Collapsed “סינון ומיון” with a button that opens a bottom sheet or inline expand; show active filter count and one-tap clear. Keep price slider and sort in the same place.
   - **Always:** Show a short summary of active filters (e.g. “עד ₪500 · מיון: מחיר”) and sync everything to URL.

4. **Results:**
   - Same `ListingCard` styling (design system consistency). Optional: add small labels (“חדש,” “מאומת”) where data exists.
   - Desktop: consider list+map split or a persistent map strip for “nearby” when geo is added.
   - Empty state: keep current message; optionally add suggestions (categories, clear filters, or “הצג את כל המודעות”).

5. **Discovery enhancements (when data/API allow):**
   - “Recently viewed” row (requires storage/API).
   - “Popular” or “מומלצות” section (requires API).
   - Location-based discovery (requires geo in API and UI).

6. **Trust and guidance:**
   - Optional trust strip or one line under the hero.
   - Optional short guidance (“חפשו לפי קטגוריה או מילות מפתח”) near search.

---

# 9. Best first implementation batch

High-value, practical improvements that don’t require new APIs or backend changes (except where noted):

1. **Search page hero / top band (aligned with homepage):** Add a compact hero band: same blue→mint gradient, headline (e.g. “גלה ציוד להשכרה”), and the existing search input (or shared `SearchInput`) in a card-style block. Optional one-line trust. No background image to keep scope small. **Files:** `app/(main)/search/page.tsx`, optionally a small `SearchHero.tsx` or inline in page.

2. **Reuse homepage category rail on search:** Use `DesktopCategoryDiscovery` (or a shared category component) below the hero on search so category discovery is identical to homepage: segments + chips, same styling. Remove or reduce the duplicate category `<select>` in the filters Card so category has one source of truth. **Files:** `app/(main)/search/search-client.tsx`, possibly `app/(main)/search/page.tsx` if hero and categories are server-rendered.

3. **Active filter summary:** Show a single line or chip row when any filter is active (e.g. “קטגוריה: צילום ווידאו · עד ₪500 · מיון: מחיר” or chips). Include “נקה הכל” or per-dimension clear. **Files:** `search-client.tsx`.

4. **Filters on mobile: collapsible or sheet:** On mobile only, replace the always-open filters Card with a “סינון ומיון (N)” button that opens a bottom sheet or expandable section; keep category in the discovery block. **Files:** `search-client.tsx`; may need a simple `FilterSheet` or `CollapsibleFilters` component.

5. **Trust line under hero (search page):** Add one line of reassurance (e.g. from `HOME_TRUST_ONELINER` or a search-specific line) under the search band to align with homepage trust. **Files:** `app/(main)/search/page.tsx` or the new hero component.

6. **Desktop layout: filters + results use width:** On `md+`, lay out filters in a sidebar (or compact top bar) and results in a wider grid (e.g. 3–4 columns) so the page uses horizontal space and feels like a dashboard. **Files:** `search-client.tsx`, possibly layout or wrapper in `page.tsx`.

7. **Empty state and map:** When `view === "map"` and `items.length === 0`, show a dedicated empty state (e.g. “אין תוצאות במפה — נסו להרחיב את החיפוש”) instead of an empty map only. **Files:** `search-client.tsx`.

8. **Loading more: skeletons or consistent feedback:** When loading more in list view, show 2–3 skeleton cards at the bottom instead of only “טוען עוד...” to reduce layout shift and perceived wait. **Files:** `search-client.tsx`.

---

# 10. Safest insertion points (exact files/components)

| Area | File(s) | Component(s) / notes |
|------|--------|----------------------|
| Search route & shell | `app/(main)/search/page.tsx` | Add hero band, optional trust line; wrap or pass nothing to SearchClient. |
| Search layout (desktop) | `app/(main)/layout.tsx` or AppShell | Only if search needs different shell (e.g. no bottom nav on desktop); currently no change needed. |
| AppShell | `components/app-shell.tsx` | Optional: treat `pathname === "/search"` like home for header/padding (e.g. reduce top padding or show different header). |
| Search client (state, API, URL) | `app/(main)/search/search-client.tsx` | All filters, sort, view, results, empty, loading, error. Primary file for filter summary, category reuse, desktop layout, filter sheet, map empty state, load-more skeletons. |
| Category discovery | `components/home/DesktopCategoryDiscovery.tsx` | Reuse as-is on search (below hero); or extract shared `CategoryDiscoveryRail` used by home and search. |
| Hero / search band | New or inline | New: `components/search/SearchHero.tsx` or `components/search/SearchPageHero.tsx`. Inline: `app/(main)/search/page.tsx`. |
| Filters UI | `search-client.tsx` or new | New: `components/search/FilterBar.tsx`, `FilterSheet.tsx`, or `CollapsibleFilters.tsx` if logic is moved out of search-client. |
| Listing cards | `components/listing-card.tsx` | Only if search-specific props or variants (e.g. “new” badge, compact row) are added; otherwise no change. |
| Empty state | `components/ui/empty-state.tsx` | Optional: search-specific variant or copy; or pass custom icon/copy from search-client. |
| Map | `components/listings-map.tsx` | Only if map-specific empty state is implemented inside the component; otherwise empty state is in search-client around the map. |
| API | `app/api/listings/search/route.ts` | No change for the first batch; later: geo, sort by distance, “popular” or “featured” if needed. |
| Copy / constants | `lib/copy/help-reassurance.ts` or new | Optional: `SEARCH_TRUST_ONELINER` or reuse `HOME_TRUST_ONELINER` for search hero. |

---

*End of audit. No code changes; implementation should follow this document and product priorities.*
