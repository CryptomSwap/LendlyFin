# Lendly final

This is the **Lendly final** app. All app code lives in this repo.

## Run the app (full stack)

From the **repository root** (not `lendly-frontend/`):

```bash
npm install
cp .env.example .env.local
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Run the redesign prototype only

The standalone UI prototype lives in `lendly-frontend/` (mock data, no backend):

```bash
cd lendly-frontend
npm install
npm run dev
```

Then open **http://localhost:3001** (port 3001 avoids clashing with the main app on 3000).

## First-time setup

1. Copy `.env.example` to `.env.local` and set any required values. For Google sign-in, see **docs/LOCAL_GOOGLE_AUTH.md**.
2. Database: `npx prisma migrate deploy` then `npm run db:seed` for QA seed data.
3. If `npm run dev` says port 3000 is in use or a lock file exists, stop other Next.js processes (`pkill -f "next dev"`) and delete `.next/dev/lock` if needed.

## Docs

- **docs/LOCAL_QA_WORKFLOW.md** — local QA: test as admin, lender, renter (DEV_AUTH_BYPASS + seed).
- **docs/LOCAL_GOOGLE_AUTH.md** — local Google OAuth setup and verification.
- `LENDLY_PORT_PLAN_ISSUES.md` — port plan (Repo A → Repo B).
- `LENDLY_REPO_COMPARISON_REPORT.md` — repo comparison.
