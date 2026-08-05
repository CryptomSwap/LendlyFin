# Observability Setup (Beta)

The app now supports two layers:

- Structured JSON logs for critical API operations.
- Sentry error monitoring for client/server runtime failures.

## What is logged

- Success events for sensitive actions (manual payment confirmation, dispute resolution, KYC upload, payment intent/confirm).
- Structured error events for failures in critical routes.
- Existing audit log entries in the database remain the source of truth for admin actions.

## Local behavior

- Logs are written to stdout/stderr as JSON lines.
- Sentry is optional locally; if DSN is unset, capture is effectively disabled.

## Sentry setup (recommended)

1. Create a Sentry project for this app.
2. Set environment variables:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
3. Deploy and trigger a test error (or use Sentry test event) to verify ingestion.

Sentry is integrated via:

- `instrumentation-client.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `app/global-error.tsx`

## Optional external forwarding

Set these environment variables to forward captured API errors to an external collector:

- `OBSERVABILITY_FORWARD_ERRORS=true`
- `OBSERVABILITY_COLLECTOR_URL=https://<your-endpoint>`

If forwarding fails, requests are not affected (best-effort only).

## Recommended dashboard widgets

- Error count by route (`payments`, `admin`, `kyc`)
- Error rate by status code (4xx vs 5xx)
- Top failing events in last 1h
- Manual payment confirmation events over time
- Dispute resolution events over time
