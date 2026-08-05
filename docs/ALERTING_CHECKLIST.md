# Alerting Checklist (Beta)

Minimum alerts to configure before broad beta access.

## API/runtime alerts

- 5xx error rate spike (global)
- 5xx error rate spike for:
  - `/api/bookings/create`
  - `/api/payments/create-intent`
  - `/api/admin/*`
  - `/api/kyc/*`
- p95 latency spike for `/api/listings/search` and `/api/bookings/create`

## Auth/security alerts

- Sudden spike in 401/403 on protected routes
- Repeated rate-limit denials from same identifier/IP
- Admin action anomalies (mass suspend, unusual dispute/payment overrides)

## Data integrity alerts

- DB connection failures
- Migration failure on deploy
- Booking creation failures above threshold

## Recommended thresholds (starter)

- Critical: >5% 5xx for 5 minutes
- Warning: >2% 5xx for 10 minutes
- Critical latency: p95 > 2s for 10 minutes

Tune these after 1 week of beta traffic.

## Ownership

- Primary on-call owner
- Secondary backup
- Escalation path (engineering lead/product lead)

Ensure all alerts route to owned channels with acknowledgement workflow.
