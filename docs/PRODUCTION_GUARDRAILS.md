# Production Guardrails

This document defines non-negotiable safety checks before and during beta launch.

## 1) Environment hard-fail checks

`lib/env.ts` enforces production requirements at runtime:

- `NEXTAUTH_SECRET` must be set.
- `NEXTAUTH_URL` must be set.
- `DATABASE_URL` must be set.
- `DEV_AUTH_BYPASS` must be disabled in production.

If any check fails, the app throws on startup/request handling to prevent an unsafe deploy.

## 2) Dev auth bypass policy

- `DEV_AUTH_BYPASS` is only valid outside production.
- Production bypass overrides are not supported.
- `/api/dev/*` remains development-only behavior.

## 3) KYC file exposure policy

- KYC files are accessed through `GET /api/kyc/files/[userId]/[type]` with auth checks and audit logging.
- Direct access to `/uploads/kyc/*` is blocked in production by `proxy.ts`.
- Production uploads use a **private S3 bucket** (see `KYC_S3_*` in `.env.example`). The database stores internal `kyc-s3:…` references; clients only receive `/api/kyc/files/...` URLs from `/api/me` and admin KYC APIs.

## 4) API abuse controls

Current rate limits include:

- Booking creation (`/api/bookings/create`)
- Booking messages (`/api/bookings/[id]/messages`)
- Booking dispute open (`/api/bookings/[id]/dispute`)
- KYC submit/upload (`/api/kyc/submit`, `/api/kyc/upload`)
- Public listing reads (`/api/listings`, `/api/listings/search`, `/api/listings/[id]`)

## 5) Pre-deploy production checklist

Before every beta deploy:

1. Verify required env vars are set in target environment.
2. Verify `DEV_AUTH_BYPASS` is unset/false in production.
3. Run `npm run lint && npm run typecheck && npm run build`.
4. Smoke-test auth, listing browse, booking create, and admin access.
5. Confirm KYC files are reachable only via the KYC file API (not direct static URL).
