# Beta Launch Checklist

Use this checklist as the single go/no-go source before opening beta access.

## 1) Security and guardrails

- [x] Production env hard-fail checks enabled (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`)
- [x] `DEV_AUTH_BYPASS` blocked in production
- [x] Direct static access to KYC uploads blocked in production
- [x] Sensitive/public endpoints have baseline rate limiting
- [ ] Production secrets rotation completed and documented

## 2) CI and release hygiene

- [x] CI runs lint + typecheck + build on PR and `main`
- [x] CI smoke API workflow runs on PR (`smoke-api`)
- [x] PR template with beta gates added
- [x] Branch protection enabled on `main` (required checks + reviews)
- [x] Release captain assigned for launch day `drives launch timeline, comms, go/no-go call input - Tomer Gerberg - +972556665431` 
- [x] Rollback owner assigned `has authority + access to redeploy previous stable commit immediately - Tomer Gerberg - +972556665431`

## 3) Observability and incident response

- [x] Structured logging for critical admin/payment/KYC paths
- [x] Incident response runbook added
- [x] Alerting checklist added
- [ ] Alerts configured in production tooling
- [ ] On-call rotation and escalation contacts confirmed

## 4) QA coverage

- [x] Manual QA workflow documented (`/dev/qa`, seed personas)
- [x] Smoke script added (`npm run smoke:api`)
- [x] QA signoff matrix documented (`docs/QA_SIGNOFF_MATRIX.md`)
- [ ] Full persona matrix executed and signed off (admin/owner/renter)
- [ ] Cross-browser sanity run complete (Chrome/Safari/Edge + mobile)
- [ ] Critical bug triage complete (all P0/P1 resolved or explicitly accepted)

## 5) Ops and support readiness

- [ ] Support contact channel visible in product/help pages
- [ ] SLA targets set (KYC, disputes, moderation, support response)
- [ ] Incident comms template prepared
- [ ] Beta metrics dashboard live (signup, listing create, booking funnel, dispute rate)

## Go / No-Go

- [ ] Go
- [ ] No-Go

Decision date:

Decision owner:

Notes:
