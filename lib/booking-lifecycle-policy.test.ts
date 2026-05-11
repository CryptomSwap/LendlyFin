import assert from "node:assert/strict";
import test from "node:test";
import {
  canCancelBooking,
  canMarkNoShow,
  mapCancelStatus,
  mapNoShowStatus,
  computeCancellationPenalty,
  computeNoShowPenalty,
} from "@/lib/booking-lifecycle-policy";

test("cancel/no-show status guards", () => {
  assert.equal(canCancelBooking("CONFIRMED"), true);
  assert.equal(canCancelBooking("ACTIVE"), false);
  assert.equal(canMarkNoShow("CONFIRMED"), true);
  assert.equal(canMarkNoShow("REQUESTED"), false);
});

test("actor status mapping", () => {
  assert.equal(mapCancelStatus("renter"), "CANCELLED_BY_RENTER");
  assert.equal(mapCancelStatus("owner"), "CANCELLED_BY_OWNER");
  assert.equal(mapNoShowStatus("renter"), "NO_SHOW_RENTER");
  assert.equal(mapNoShowStatus("owner"), "NO_SHOW_OWNER");
});

test("penalty math is bounded and non-negative", () => {
  const now = new Date("2026-01-01T10:00:00.000Z");
  const inTwoHours = new Date("2026-01-01T12:00:00.000Z");
  const inTwoDays = new Date("2026-01-03T12:00:00.000Z");
  const nearPenalty = computeCancellationPenalty({
    now,
    startDate: inTwoHours,
    totalDue: 1000,
    depositAmount: 500,
    cancelPenaltyWindowHours: 6,
  });
  const farPenalty = computeCancellationPenalty({
    now,
    startDate: inTwoDays,
    totalDue: 1000,
    depositAmount: 500,
    cancelPenaltyWindowHours: 6,
  });
  assert.equal(nearPenalty > 0, true);
  assert.equal(farPenalty, 0);
  assert.equal(computeNoShowPenalty({ noShowPenaltyMode: "FULL_DEPOSIT", totalDue: 1000, depositAmount: 400 }), 400);
  assert.equal(computeNoShowPenalty({ noShowPenaltyMode: "PARTIAL_DEPOSIT", totalDue: 1000, depositAmount: 400 }), 200);
});
