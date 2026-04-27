-- Performance indexes for common filters/sorts in listings, bookings, admin, and messaging.
CREATE INDEX IF NOT EXISTS "User_kycStatus_createdAt_idx" ON "User"("kycStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "User_suspendedAt_idx" ON "User"("suspendedAt");

CREATE INDEX IF NOT EXISTS "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Listing_status_pricePerDay_idx" ON "Listing"("status", "pricePerDay");
CREATE INDEX IF NOT EXISTS "Listing_category_subcategory_status_createdAt_idx" ON "Listing"("category", "subcategory", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "ListingBlockedRange_listingId_startDate_endDate_idx" ON "ListingBlockedRange"("listingId", "startDate", "endDate");

CREATE INDEX IF NOT EXISTS "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Booking_listingId_startDate_endDate_idx" ON "Booking"("listingId", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS "Booking_listingId_status_startDate_idx" ON "Booking"("listingId", "status", "startDate");
CREATE INDEX IF NOT EXISTS "Booking_listingId_status_endDate_idx" ON "Booking"("listingId", "status", "endDate");
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Booking_status_disputeWindowEndsAt_idx" ON "Booking"("status", "disputeWindowEndsAt");

CREATE INDEX IF NOT EXISTS "Review_bookingId_targetUserId_idx" ON "Review"("bookingId", "targetUserId");

CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

CREATE INDEX IF NOT EXISTS "Dispute_status_createdAt_idx" ON "Dispute"("status", "createdAt");
