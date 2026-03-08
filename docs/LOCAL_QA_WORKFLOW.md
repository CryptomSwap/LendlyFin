# Local QA workflow (Lendly)

Short guide for resetting and using the seeded QA environment during local product/design work.

## Reset (CLI only)

**Reset is done from the terminal.** It wipes the DB and re-runs the deterministic seed.

```bash
npm run qa:reset
```

Same as `npm run db:seed`. After reset, refresh the app (e.g. `/dev/qa`) if needed.

- **When to reset:** After manual testing has changed data and you want a clean baseline again (e.g. before a demo, or when bookings/listings are in an inconsistent state).
- **What it does:** Deletes and recreates users, listings, bookings, conversations, messages, reviews, disputes, checklists. Same outcome every run (fixed IDs, same scenarios).

---

## Recommended loop

1. **Seed** → `npm run qa:reset`
2. **Open** → [http://localhost:3000/dev/qa](http://localhost:3000/dev/qa) (requires `DEV_AUTH_BYPASS=true`)
3. **Impersonate** → Use the persona buttons to switch user
4. **Test** → Use the deep links and flows (onboarding, KYC, listings, bookings, admin)
5. **Reseed when needed** → Run `npm run qa:reset` again when state has drifted

Seeded state will drift after you create/edit/delete data in the app; there is no automatic sync. Reseed to restore the baseline.

---

## Using /dev/qa

- **Requires:** `DEV_AUTH_BYPASS=true` in `.env.local` and dev server running.
- **Page:** `/dev/qa` — QA control center: current session summary, persona switcher, scenario overview, deep links to core pages, seeded listings, seeded bookings, admin.
- **Personas:** Click a button to impersonate that user (same as the header “כניסה כ:” dropdown). Page refreshes with the new session.
- **Reset:** Use the “איפוס סביבת QA” card on the page for the exact command; run it in your terminal, do not trigger from the browser.

---

## Personas (seeded)

| Id | Purpose |
|----|---------|
| `admin-user` | Admin: confirm payment, resolve disputes, KYC review, metrics |
| `dev-user` | Owner with multiple ACTIVE listings (Sony, tent, drill, etc.) |
| `qa-renter` | Renter with REQUESTED, CONFIRMED, ACTIVE, COMPLETED, DISPUTE bookings |
| `qa-renter-no-bookings` | Renter, no bookings; browse and request |
| `qa-owner-approved` | Owner with ACTIVE listings (Bike, Laptop, Kayak) |
| `qa-owner-pending-kyc` | Owner, KYC SUBMITTED; listing PENDING_APPROVAL |
| `qa-onboarding-incomplete` | Missing phone/city; onboarding gate |
| `qa-kyc-submitted` | KYC SUBMITTED; cannot book until approved |
| `qa-kyc-rejected` | KYC REJECTED; resubmit flow |

---

## Booking scenarios (seeded)

| Id | Status | Use for |
|----|--------|---------|
| `booking-requested` | REQUESTED | Admin payment confirmation |
| `booking-confirmed` | CONFIRMED | Pickup checklist flow |
| `booking-active` | ACTIVE | Return checklist flow |
| `booking-completed` | COMPLETED | Reviews, completed UX |
| `booking-dispute` | DISPUTE | Admin dispute resolution |

Stable IDs in `lib/dev/qa-scenarios.ts`.

---

## One-time setup

1. Set `DEV_AUTH_BYPASS=true` in `.env.local`.
2. Run `npm run qa:reset` (or `npm run db:seed`).
3. Start dev server: `npm run dev`.
4. Open `/dev/qa` and start testing.

---

## Optional: test users by email

To add only the email-based test users without wiping the DB:

```bash
npm run db:seed-test-users
```

Creates/updates `admin@lendly.test`, `lender@lendly.test`, `renter@lendly.test`. Use with Google sign-in if your account matches; for daily QA, prefer DEV_AUTH_BYPASS + personas.

---

## Caveats

- **DEV_AUTH_BYPASS** is for local dev only. Do not enable in production.
- Reset is CLI-only; there is no browser-triggered DB reset.
- Payments are mocked; checkout and payment status can be tested without real charges.
