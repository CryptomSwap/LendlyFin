-- Add serviceFee, totalDue, depositStatus to Booking (payment/deposit prep)
ALTER TABLE "Booking" ADD COLUMN "serviceFee" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "totalDue" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN "depositStatus" TEXT NOT NULL DEFAULT 'PENDING';
