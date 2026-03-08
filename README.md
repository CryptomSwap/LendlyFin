# Lendly final

This is the **Lendly final** app. All app code lives in this repo.

## Run the app

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## First-time setup

1. Copy `.env.example` to `.env.local` and set any required values. For Google sign-in, see **docs/LOCAL_GOOGLE_AUTH.md**.
2. Database: `npx prisma migrate dev` then `npx prisma db seed` if you use the seed script.

## Docs

- **docs/LOCAL_QA_WORKFLOW.md** — local QA: test as admin, lender, renter (DEV_AUTH_BYPASS + seed).
- **docs/LOCAL_GOOGLE_AUTH.md** — local Google OAuth setup and verification.
- `LENDLY_PORT_PLAN_ISSUES.md` — port plan (Repo A → Repo B).
- `LENDLY_REPO_COMPARISON_REPORT.md` — repo comparison.
