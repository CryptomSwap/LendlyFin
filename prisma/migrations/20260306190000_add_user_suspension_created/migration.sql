-- Add createdAt to User (suspendedAt/suspensionReason were added in a prior partial apply)
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME;
UPDATE "User" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
