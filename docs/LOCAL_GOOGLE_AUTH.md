# Local Google OAuth setup (Lendly Tom)

Use this to get “המשך עם Google” working in development with NextAuth.

## 1. Environment variables

Copy `.env.example` to `.env.local` (if you don’t have it yet), then set:

| Variable | Example / notes |
|----------|------------------|
| `NEXTAUTH_URL` | `http://localhost:3000` (must match your dev origin) |
| `NEXTAUTH_SECRET` | Any random string (e.g. 32+ chars). Used for JWT signing. |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (OAuth 2.0 client ID) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (same client) |

Restart the dev server after changing `.env.local`.

## 2. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select (or create) a project.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Set:
   - **Authorized JavaScript origins:**  
     `http://localhost:3000`
   - **Authorized redirect URIs:**  
     `http://localhost:3000/api/auth/callback/google`
5. Create and copy the **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`.

## 3. Verify the flow

1. **Providers**  
   Open: `http://localhost:3000/api/auth/providers`  
   You should see JSON including `google` (e.g. `{ "google": { "id": "google", "name": "Google", ... } }`). If `google` is missing, the four env vars are not loaded or the server wasn’t restarted.

2. **Sign-in page**  
   Open: `http://localhost:3000/signin`  
   You should see the “המשך עם Google” button (no “התחברות עם Google אינה מוגדרת” message).

3. **One-click Google**  
   Click “המשך עם Google”. You should be redirected to Google, then back to the app (e.g. `/profile` or your `callbackUrl`).

4. **Onboarding**  
   If the user has no name/phone/city, they should be redirected to `/onboarding` after sign-in, then to the intended `callbackUrl` after completing onboarding.

5. **Errors**  
   If you see `error=OAuthSignin` on `/signin`, the amber box explains: check the four env vars and that the redirect URI in Google Console is exactly `http://localhost:3000/api/auth/callback/google` (no trailing slash, same origin/port).

## 4. Quick checklist

- [ ] `.env.local` has `NEXTAUTH_URL=http://localhost:3000`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] Google Cloud: OAuth 2.0 Web application; Authorized JavaScript origin `http://localhost:3000`; Authorized redirect URI `http://localhost:3000/api/auth/callback/google`
- [ ] Dev server restarted after editing `.env.local`
- [ ] `GET /api/auth/providers` includes `google`
- [ ] `/signin` shows the Google button and sign-in completes without `OAuthSignin` error
