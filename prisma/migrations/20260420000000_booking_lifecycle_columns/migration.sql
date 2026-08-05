-- Columns referenced by prisma/schema.prisma Booking model but absent from the baseline migration.
-- Required before indexes on disputeWindowEndsAt (see 20260424123000_add_performance_indexes).
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "returnedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "disputeWindowEndsAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "nonReturnMarkedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "nonReturnReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "riskFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "riskReason" TEXT;
