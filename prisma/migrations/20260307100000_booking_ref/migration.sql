-- Human-readable booking reference for Bit/support (e.g. LND-A1B2C3)
ALTER TABLE "Booking" ADD COLUMN "bookingRef" TEXT;
CREATE UNIQUE INDEX "Booking_bookingRef_key" ON "Booking"("bookingRef");
