# Deterministic debug: Google sign-in button

## 1. Temporary logging (added)

In `components/sign-in-google-button.tsx` the following logs are in place:

| Log | When |
|-----|------|
| `[SignInGoogle] render` + `{ callbackUrl }` | Component mounts / callbackUrl changes |
| `[SignInGoogle] click` | Button onClick fired |
| `[SignInGoogle] callbackUrl` + `{ callbackUrl, absoluteUrl }` | Right before signIn() |
| `[SignInGoogle] calling signIn(...)` | Immediately before await signIn() |
| `[SignInGoogle] signIn result` + result | After signIn() resolves (if it does) |
| `[SignInGoogle] caught error` + err | If signIn() throws |

No fallback redirects: only `signIn("google", { callbackUrl: absoluteUrl, redirect: true })` runs.

---

## 2. Verify in browser / devtools

### A. Console

1. Open app (e.g. `npm run dev`), go to `/signin`.
2. Open DevTools → Console. Filter or watch for `[SignInGoogle]`.
3. Note order of logs:
   - You must see `render` (and optionally again on hydration).
   - Click the “המשך עם Google” button.
   - Record: do you see `click`? Then `callbackUrl`? Then `calling signIn(...)`?
   - Then either `signIn result` (and what is `result`?) or `caught error` (and the error message/stack).

Interpretation:

- No `click` → click not firing (event or DOM issue).
- `click` but no `calling signIn(...)` → something threw or didn’t run between click and signIn.
- `calling signIn(...)` but no `signIn result` and no `caught error` → signIn() never resolved (e.g. redirect happened, or hang).
- `signIn result` with `result === undefined` or no `url` and no redirect → NextAuth did not redirect (config/redirect issue).
- `caught error` → exact failure; use message and stack.

### B. Network

1. DevTools → Network. Preserve log if available.
2. Click “המשך עם Google”.
3. Check:
   - Is any request sent after click? (e.g. to `/api/auth/...` or similar.)
   - If yes: method, URL, status, and response (e.g. redirect target).

Interpretation:

- No request → client never called NextAuth API (e.g. signIn() didn’t run or didn’t trigger a request).
- Request to `/api/auth/signin/google` or similar with 302/303 → redirect to Google; if user still sees “nothing”, the redirect target URL might be wrong or blocked.

### C. Providers and signin route

1. In the same origin as the app, open:
   - `http://localhost:3000/api/auth/providers` (or your dev URL).
   - Expected: JSON with `google: { id: "google", name: "Google", ... }`. If `google` is missing or empty, provider registration is wrong.
2. Open:
   - `http://localhost:3000/api/auth/signin/google` (or your dev URL).
   - Expected: 302 redirect to `accounts.google.com`. If 4xx/5xx or HTML error page, the auth route or NextAuth config is failing.

### D. Console / runtime / hydration errors

- In Console, check for red errors (before and after click), especially:
  - Hydration mismatches.
  - “Cannot read property … of undefined” or similar.
  - NextAuth or React errors.
- Note the exact message and stack; they can explain why the button “does nothing” or fails inconsistently.

---

## 3. NextAuth config and environment (codebase)

Checked in the repo:

| Item | Location | Finding |
|------|----------|--------|
| Google provider | `lib/auth/nextauth-options.ts` | `GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" })`. If either is missing in env, they are `""`. |
| NEXTAUTH_URL | `.env.example` | Commented: `# NEXTAUTH_URL=http://localhost:3000`. Not set by default. NextAuth v4 can infer from request; wrong base URL can break redirects. |
| NEXTAUTH_SECRET | nextauth-options | `secret: process.env.NEXTAUTH_SECRET`. Required for JWT. |
| Auth route | `app/api/auth/[...nextauth]/route.ts` | `export { handler as GET, handler as POST }`. Correct for App Router. |
| Redirect callback | nextauth-options | `redirect({ url, baseUrl })` normalizes relative URLs. OK. |

What you must verify locally (not in repo):

- `.env.local` (or the env used by `next dev`):  
  - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set and non-empty.  
  - (`.env.example` does not list these; they are only used in `nextauth-options.ts`. If you never added them, they are unset.)
  - `NEXTAUTH_SECRET` set.
  - Optionally `NEXTAUTH_URL=http://localhost:3000` (or your dev URL) to avoid wrong redirect base.

If `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is empty, NextAuth may still load but the Google OAuth redirect can fail or “do nothing” deterministically or inconsistently.

---

## 4. Exact failure point (fill after running the steps above)

- **Observed runtime sequence:**  
  (e.g. “render → click → callbackUrl → calling signIn → no result, no error” or “render → click → caught error: …”)

- **Exact failure point:**  
  (e.g. “signIn() resolves with undefined and no redirect” or “signIn() throws with …” or “click log never appears”.)

- **Root cause:**  
  (e.g. “Empty GOOGLE_CLIENT_ID” or “NEXTAUTH_URL mismatch so redirect is to wrong origin” or “signIn() in NextAuth v4 with redirect: true never resolves and no redirect”.)

Once this is filled, the fix should target that root cause only (no extra fallback layers unless justified by this evidence).
