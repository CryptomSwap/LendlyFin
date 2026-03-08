-- Backfill: existing listings (created before status existed) become ACTIVE so they remain public
UPDATE "Listing" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING_APPROVAL';
