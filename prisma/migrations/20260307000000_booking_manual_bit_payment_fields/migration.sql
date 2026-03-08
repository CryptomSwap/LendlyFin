-- Manual Bit payment-link flow: payment method, link, confirmation audit fields
ALTER TABLE "Booking" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paymentLink" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paymentConfirmedAt" DATETIME;
ALTER TABLE "Booking" ADD COLUMN "paymentConfirmedByAdminId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paymentNotes" TEXT;
