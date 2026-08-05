# Infrastructure Readiness (Stage 1)

This stage ensures the platform is operable and recoverable before beta traffic.

## 1) Branch protection on `main`

Enable these repository settings:

- Require pull request before merging
- Require approvals (at least 1)
- Dismiss stale approvals on new commits
- Require status checks:
  - `validate` (from `.github/workflows/ci.yml`)
  - `smoke-api` (from `.github/workflows/smoke-api.yml`)
- Restrict direct pushes to `main`

Use:

```bash
npm run ops:check-branch-protection
```

to verify branch protection is enabled and required checks are configured.

## 2) Environment parity checks

Required env vars for production:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`

Use:

```bash
npm run env:check
```

to validate the current shell environment before deploy.

## 3) Database backup and restore drill

Run a dry-run drill in staging (same engine/version as production):

1. Take a backup snapshot.
2. Restore to a separate staging instance.
3. Run smoke checks against restored DB.
4. Record elapsed restore time and data integrity outcome.

Exit criteria:

- restore succeeds without manual DB surgery
- core app flows remain functional after restore
- restore duration meets your recovery objective

## 4) Rollback rehearsal

Follow `docs/RELEASE_RUNBOOK.md` rollback section once end-to-end.

Exit criteria:

- previous release is deployable on demand
- rollback + smoke validation is documented and repeatable
