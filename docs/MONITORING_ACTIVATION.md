# Monitoring Activation (Stage 2)

This stage moves from "monitoring docs exist" to "alerts are live and tested."

## Required live alerts

Configure all items from `docs/ALERTING_CHECKLIST.md` in your monitoring stack.

Minimum required before beta:

- Global 5xx rate spike
- `/api/bookings/create` 5xx spike
- `/api/payments/create-intent` 5xx spike
- `/api/admin/*` 5xx spike
- `/api/kyc/*` 5xx spike
- Auth 401/403 anomaly spike
- p95 latency alerts for search and booking create

## Log signal validation

Confirm that structured logs from `lib/observability.ts` are visible in your log tool:

- `admin.confirm_manual_payment`
- `admin.resolve_dispute`
- `kyc.upload.success`
- `payments.create_intent.success`
- `payments.confirm.success`
- corresponding `*.failed` error events

## Alert delivery test

Run one controlled test:

1. Trigger a known failing request in staging (safe endpoint).
2. Confirm alert is delivered to the on-call channel.
3. Confirm acknowledgement and triage response.
4. Confirm incident notes are captured.

Exit criteria:

- alert fired
- alert routed to right owners
- acknowledgement/response under target SLA
