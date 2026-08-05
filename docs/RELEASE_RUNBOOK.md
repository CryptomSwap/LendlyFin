# Release Runbook (Beta)

## Pre-release (T-24h)

1. Confirm `main` is green in CI.
2. Review `docs/BETA_LAUNCH_CHECKLIST.md` and close blockers.
3. Verify production environment variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
4. Verify `DEV_AUTH_BYPASS` is unset/false in production.
5. Confirm alerts and on-call owners are active.

## Release execution (T-0)

1. Announce release start in team channel.
2. Deploy latest `main`.
3. Run smoke tests:
   - homepage/search load
   - listing detail
   - booking create attempt
   - admin login + key admin actions
4. Check logs and 5xx/error alerts for 15 minutes.

## Rollback criteria

Rollback immediately if any of these occur:

- sustained 5xx > 5% for 5 minutes
- authentication failures block most users
- booking flow is broken for new attempts
- security/privacy regression detected

## Rollback steps

1. Re-deploy previous stable commit.
2. Re-run smoke tests on stable commit.
3. Post incident note with root cause hypothesis and next action.

## Post-release (T+1h)

1. Confirm baseline metrics and error rate normalize.
2. Capture release notes and known issues.
3. Create follow-up tasks for non-blocking regressions.
