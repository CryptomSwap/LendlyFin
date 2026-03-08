# Auth entry audit and implementation summary

## 1. Current auth implementation (pre-change)

### Auth routes
- **`/signin`** — Dedicated sign-in page (Next.js page).
- **`/api/auth/*`** — NextAuth catch-all (Google provider, JWT strategy).
- No separate `/signup`; Google is used for both sign-in and sign-up.

### Sign-in page
- **File:** `app/(main)/signin/page.tsx`
- **Content:** Title "התחברות", one paragraph, one button "התחבר עם Google" linking to `/api/auth/signin?callbackUrl=...`.
- **Behavior:** If already logged in, redirects to `callbackUrl` or `/profile`. No "הרשמה" or "Continue with Google" wording.

### Where Google sign-in is triggered
- Only from the `/signin` page via `<Link href={signInUrl}>` to NextAuth’s signin URL.

### Login/signup buttons in the app
- **Header:** Only the logo (centered). No auth link.
- **Homepage:** No auth CTA.
- **Bottom nav:** "פרופיל" links to `/profile`; unauthenticated users are redirected to `/signin` by middleware. No explicit "התחברות" or "הרשמה".
- **Listing page:** CreateBookingCTA calls `/api/me`; if 401 it showed the KYC box and "התחל אימות זהות" → `/profile/kyc`, which then redirects to sign-in. No direct "התחברו כדי להזמין" on the listing.

### Unauthenticated user behavior (before changes)
| Action | Result |
|--------|--------|
| Browse `/`, `/home`, `/search`, `/help` | Allowed (public). |
| Open a listing `/listing/[id]` | Allowed. |
| Create a listing (go to `/add`) | Middleware redirects to `/signin?callbackUrl=/add`. |
| Start a booking (listing page) | CreateBookingCTA shows KYC message and link to `/profile/kyc` → redirect to sign-in. No clear "log in to book" CTA. |
| Access profile `/profile` | Middleware redirects to `/signin?callbackUrl=/profile`. |
| Access owner dashboard `/owner` | Page redirects to `/signin`. |
| Access bookings `/bookings` | Middleware redirects to `/signin?callbackUrl=/bookings`. |

---

## 2. Files inspected

- `app/(main)/signin/page.tsx` — Sign-in page.
- `app/(main)/layout.tsx` — Main layout (AppShell).
- `components/app-shell.tsx` — Header + bottom nav.
- `components/bottom-nav.tsx` — Bottom nav links.
- `app/(main)/home/page.tsx` — Homepage.
- `app/(main)/listing/[id]/page.tsx` — Listing detail + CreateBookingCTA.
- `components/create-booking-cta.tsx` — Booking CTA and KYC/sign-in handling.
- `middleware.ts` — Protected paths and redirect to `/signin`.
- `lib/auth/nextauth-options.ts` — NextAuth config, `signIn: "/signin"`.
- `app/api/me/route.ts` — Returns 401 when unauthenticated.

---

## 3. Implementation plan (executed)

1. **Header auth entry** — Add a client component that uses `useSession()` and shows "התחברות" (link to `/signin`) when unauthenticated and "פרופיל" when authenticated. Render it in the app shell header with the logo still centered.
2. **Homepage auth CTA** — On the home page, if `getCurrentUser()` is null, render a short CTA: "משכירים או שוכרים? התחברו עם Google…" and a "המשך עם Google" button to `/signin`.
3. **Sign-in page copy** — Set title to "התחברות או הרשמה", clarify subtitle, and set button text to "המשך עם Google" with gradient style.
4. **Listing booking CTA** — In CreateBookingCTA, when `/api/me` returns 401 (or no user), show a dedicated state: "התחברו כדי לבחור תאריכים ולהזמין" and a primary button to `/signin?callbackUrl=/listing/[id]` so after login the user returns to the same listing.

No schema, middleware, or NextAuth config changes. No email/password. RTL and existing design preserved.

---

## 4. Files changed

| File | Change |
|------|--------|
| `components/auth-header-link.tsx` | **New.** Client component: "התחברות" or "פרופיל" based on `useSession()`. |
| `components/app-shell.tsx` | Render `AuthHeaderLink` in header; layout adjusted so logo stays centered. |
| `app/(main)/home/page.tsx` | Async page, `getCurrentUser()`; show auth CTA block when `!user`. |
| `app/(main)/signin/page.tsx` | Title "התחברות או הרשמה", updated subtitle, button "המשך עם Google" and `variant="gradient"`, `dir="rtl"`. |
| `components/create-booking-cta.tsx` | Track `isLoggedIn` from `/api/me`; when unauthenticated show sign-in CTA with `callbackUrl` to current path. |

---

## 5. Login/signup and auth-entry surfaces added or improved

- **Header:** Visible "התחברות" when logged out and "פרופיל" when logged in (same shell on all main pages).
- **Homepage:** Auth CTA card for guests: "משכירים או שוכרים? התחברו עם Google…" and "המשך עם Google".
- **Sign-in page:** Clear "התחברות או הרשמה" and "המשך עם Google", aligned with the rest of the product.
- **Listing page (booking):** When not logged in, a clear "התחברו כדי לבחור תאריכים ולהזמין" and "המשך עם Google" that returns to the same listing after login.

Existing behavior kept: middleware still redirects protected routes to `/signin?callbackUrl=...`, and the profile link in the bottom nav still sends unauthenticated users to sign-in.

---

## 6. Manual QA checklist

### Unauthenticated → sign-in
- [ ] **Header:** From any page, "התחברות" appears in the header and links to `/signin`.
- [ ] **Home:** On `/` or `/home`, the auth CTA card is visible; "המשך עם Google" goes to `/signin`.
- [ ] **Sign-in page:** Title "התחברות או הרשמה", button "המשך עם Google"; click starts Google OAuth.

### Sign-in → onboarding
- [ ] After first Google login, if onboarding is incomplete, user is redirected to `/onboarding?callbackUrl=...`.
- [ ] After completing onboarding, user is sent to `callbackUrl` or `/profile`.

### Callback after sign-in
- [ ] Open `/signin?callbackUrl=/profile` → sign in → land on `/profile`.
- [ ] Open a listing, click "המשך עם Google" in the booking area → sign in → land back on the same listing page.

### Authenticated
- [ ] Header shows "פרופיל" (no "התחברות").
- [ ] Homepage does not show the auth CTA card.
- [ ] On a listing, the booking form (dates + "המשך לתשלום") or KYC message is shown as before, not the sign-in CTA.

### RTL and layout
- [ ] All new copy is correct in RTL; sign-in page and new CTAs look good on mobile.

### No regressions
- [ ] Protected routes (`/add`, `/profile`, `/bookings`, `/owner`, etc.) still redirect to `/signin` when not logged in.
- [ ] KYC flow for logged-in, non-approved users on the listing page unchanged (message + "התחל אימות זהות" to `/profile/kyc`).
