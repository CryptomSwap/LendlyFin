# QA Signoff Matrix (Stage 3)

Mark each scenario pass/fail and attach evidence (screenshot/video/log link).

## Renter

- [ ] Sign in and complete onboarding gate
- [ ] Browse listings list + search + detail
- [ ] Attempt booking with unavailable dates (expect conflict)
- [ ] Create valid booking request
- [ ] Open booking messages and send message
- [ ] Submit KYC (approved and rejected personas)
- [ ] Verify clear error states for blocked flows

## Owner

- [ ] Create listing with images and valid fields
- [ ] Edit/manage listing (pickup note, rules, blocked dates)
- [ ] Review booking state transitions from owner perspective
- [ ] Verify owner dashboard loads with expected data

## Admin

- [ ] Open admin listings queue and moderate listing
- [ ] Review and decide KYC submission
- [ ] Confirm manual payment for booking
- [ ] Resolve dispute as owner/renter/split
- [ ] Suspend and unsuspend a user
- [ ] Verify security events/audit screens render data

## Regression / quality gates

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run smoke:api` (dev or staging base URL)

## Browser sanity

- [ ] Chrome desktop
- [ ] Safari desktop
- [ ] Edge desktop
- [ ] Mobile viewport sanity (iOS Safari / Android Chrome)

## Signoff

Date:

Release candidate commit:

QA owner:

Decision:

- [ ] PASS (ready for beta)
- [ ] FAIL (blockers remain)
