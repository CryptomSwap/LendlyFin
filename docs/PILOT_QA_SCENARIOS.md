# Pilot QA Scenarios

## 1) Happy Path (No Dispute)
1. Renter creates booking -> status `REQUESTED`.
2. Admin confirms payment -> status `CONFIRMED`.
3. Renter completes pickup checklist -> status `ACTIVE`.
4. Renter completes return checklist with no issues -> status `RETURNED`.
5. Verify dispute cannot be opened after 48h window.
6. Admin triggers `complete_after_dispute_window` -> status `COMPLETED`.
7. Verify analytics events:
   - `booking_started`
   - `booking_confirmed`
   - `pickup_checklist_submitted`
   - `return_checklist_submitted`
   - `booking_completed`

## 2) Dispute Path
1. Follow steps to `RETURNED`.
2. Open dispute from renter/lender UI (`/bookings/[id]/dispute`) within 48h.
3. Verify status becomes `IN_DISPUTE` and dispute row is created.
4. Admin resolves dispute from admin dispute flow.
5. Verify booking becomes `COMPLETED`.
6. Verify analytics events:
   - `dispute_opened`
   - `dispute_resolved`
   - `booking_completed`

## 3) Non-Return Path
1. Move booking to `ACTIVE`.
2. Admin marks booking `mark_non_return_pending`.
3. Verify status `NON_RETURN_PENDING` and audit log entry.
4. Admin confirms non-return via `confirm_non_return`.
5. Verify status `NON_RETURN_CONFIRMED` and audit log entry.
6. Verify status labels appear correctly in:
   - user booking page
   - admin booking list/detail

## 4) Policy Guard Checks
- Opening dispute after dispute window end returns validation error.
- Non-return actions are rejected for invalid prior statuses.
- `complete_after_dispute_window` rejected when window is not finished.

