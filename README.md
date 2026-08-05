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
2. **Database:** Create a **PostgreSQL** database and set **`DATABASE_URL`** in **`.env`** (Prisma 7 uses `prisma.config.ts`; connection URL is not in `schema.prisma`). Then run `npx prisma migrate deploy` (or `npx prisma migrate dev` while iterating on migrations) and optionally `npx prisma db seed`.

## Docs

- **docs/LOCAL_QA_WORKFLOW.md** — local QA: test as admin, lender, renter (DEV_AUTH_BYPASS + seed).
- **docs/LOCAL_GOOGLE_AUTH.md** — local Google OAuth setup and verification.
- **docs/PRODUCTION_GUARDRAILS.md** — required production safety checks and deploy guardrails.
- **docs/INFRA_READINESS.md** — infrastructure readiness checks (branch protection, env, backup/restore drill).
- **docs/INCIDENT_RESPONSE_RUNBOOK.md** — production incident response flow and severity guide.
- **docs/ALERTING_CHECKLIST.md** — minimum alert set for beta operations.
- **docs/OBSERVABILITY_SETUP.md** — structured logging and optional external error forwarding.
- **docs/MONITORING_ACTIVATION.md** — steps to activate and validate live alerts/signals.
- **docs/BETA_LAUNCH_CHECKLIST.md** — go/no-go checklist for beta launch.
- **docs/QA_SIGNOFF_MATRIX.md** — persona-by-persona QA signoff matrix.
- **docs/RELEASE_RUNBOOK.md** — release/rollback playbook for beta operations.
- `LENDLY_PORT_PLAN_ISSUES.md` — port plan (Repo A → Repo B).
- `LENDLY_REPO_COMPARISON_REPORT.md` — repo comparison.
