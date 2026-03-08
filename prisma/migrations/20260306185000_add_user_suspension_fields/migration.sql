-- Add suspension fields to User (for fresh installs; may already exist on some DBs)
ALTER TABLE "User" ADD COLUMN "suspendedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "suspensionReason" TEXT;
