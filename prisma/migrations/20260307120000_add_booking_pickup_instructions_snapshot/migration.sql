-- Snapshot of listing pickup instructions at booking creation
ALTER TABLE "Booking" ADD COLUMN "pickupInstructionsSnapshot" TEXT;
