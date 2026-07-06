-- Booking lifecycle + risk fields (schema drift fix)

ALTER TABLE "Booking" ADD COLUMN "returnedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "disputeWindowEndsAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "nonReturnMarkedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "nonReturnReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN "riskFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "riskReason" TEXT;

CREATE INDEX IF NOT EXISTS "Booking_status_disputeWindowEndsAt_idx" ON "Booking"("status", "disputeWindowEndsAt");
