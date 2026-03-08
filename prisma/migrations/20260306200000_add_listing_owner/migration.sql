-- Add listing ownership: ownerId + index
-- SQLite: add nullable column then backfill (no NOT NULL to avoid table rebuild)

ALTER TABLE "Listing" ADD COLUMN "ownerId" TEXT;

-- Backfill: assign existing listings to the first user (by id) so no row is left broken.
-- If no users exist, ownerId remains NULL (edge case; seed creates users first).
UPDATE "Listing"
SET "ownerId" = (SELECT "id" FROM "User" ORDER BY "id" ASC LIMIT 1)
WHERE "ownerId" IS NULL;

CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");
