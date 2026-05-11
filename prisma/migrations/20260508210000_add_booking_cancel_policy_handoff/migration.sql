-- Additive: cancellation / no-show metadata, policy config, handoff proof, dispute enrichment.
-- BookingStatus new enum values need no SQLite DDL (stored as TEXT).

-- AlterTable Booking
ALTER TABLE "Booking" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "cancelledByUserId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "cancellationReasonCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN "cancellationNote" TEXT;
ALTER TABLE "Booking" ADD COLUMN "cancellationPenaltyAmount" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "refundAmount" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "noShowMarkedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "noShowMarkedByUserId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "noShowReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN "policyVersion" TEXT;
ALTER TABLE "Booking" ADD COLUMN "graceMinutesSnapshot" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "cancelWindowHoursSnapshot" INTEGER;

-- AlterTable Dispute (safe if column already exists from drift — reset DB or run db push)
ALTER TABLE "Dispute" ADD COLUMN "userReasonCode" TEXT;
ALTER TABLE "Dispute" ADD COLUMN "evidenceSummary" TEXT;
ALTER TABLE "Dispute" ADD COLUMN "evidenceSubmittedAt" DATETIME;

-- CreateTable PolicyConfig
CREATE TABLE "PolicyConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lateReturnGraceMinutes" INTEGER NOT NULL DEFAULT 30,
    "cancelPenaltyWindowHours" INTEGER NOT NULL DEFAULT 6,
    "noShowPenaltyMode" TEXT NOT NULL DEFAULT 'PARTIAL_DEPOSIT',
    "maxLateFeePercent" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "PolicyConfig_version_key" ON "PolicyConfig"("version");
CREATE INDEX "PolicyConfig_isActive_createdAt_idx" ON "PolicyConfig"("isActive", "createdAt");

-- CreateTable BookingHandoffProof
CREATE TABLE "BookingHandoffProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "source" TEXT NOT NULL DEFAULT 'user_device',
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingHandoffProof_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "BookingHandoffProof_bookingId_type_capturedAt_idx" ON "BookingHandoffProof"("bookingId", "type", "capturedAt");

CREATE INDEX "Booking_status_cancelledAt_idx" ON "Booking"("status", "cancelledAt");
CREATE INDEX "Dispute_userReasonCode_createdAt_idx" ON "Dispute"("userReasonCode", "createdAt");
