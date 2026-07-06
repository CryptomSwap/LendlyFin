-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "bookingId" TEXT,
    "userId" TEXT,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminActionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "disputeId" TEXT,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "adminUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("bookingId", "createdAt", "id", "updatedAt") SELECT "bookingId", "createdAt", "id", "updatedAt" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE UNIQUE INDEX "Conversation_bookingId_key" ON "Conversation"("bookingId");
CREATE INDEX "Conversation_bookingId_idx" ON "Conversation"("bookingId");
CREATE TABLE "new_Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "userReasonCode" TEXT,
    "adminReasonCode" TEXT,
    "resolutionOutcome" TEXT,
    "evidenceChecklist" TEXT,
    "evidenceSummary" TEXT,
    "evidenceSubmittedAt" DATETIME,
    "financialActionNote" TEXT,
    "resolvedByAdminId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedByUserId" TEXT,
    "adminNote" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Dispute" ("adminNote", "bookingId", "createdAt", "evidenceSubmittedAt", "evidenceSummary", "id", "openedByUserId", "reason", "resolutionNote", "resolvedAt", "status", "updatedAt", "userReasonCode") SELECT "adminNote", "bookingId", "createdAt", "evidenceSubmittedAt", "evidenceSummary", "id", "openedByUserId", "reason", "resolutionNote", "resolvedAt", "status", "updatedAt", "userReasonCode" FROM "Dispute";
DROP TABLE "Dispute";
ALTER TABLE "new_Dispute" RENAME TO "Dispute";
CREATE UNIQUE INDEX "Dispute_bookingId_key" ON "Dispute"("bookingId");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX "Dispute_bookingId_idx" ON "Dispute"("bookingId");
CREATE INDEX "Dispute_status_createdAt_idx" ON "Dispute"("status", "createdAt");
CREATE INDEX "Dispute_userReasonCode_createdAt_idx" ON "Dispute"("userReasonCode", "createdAt");
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pricePerDay" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "statusRejectionReason" TEXT,
    "valueEstimate" INTEGER,
    "pickupNote" TEXT,
    "rules" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("category", "city", "createdAt", "deposit", "description", "id", "lat", "lng", "ownerId", "pickupNote", "pricePerDay", "rules", "status", "statusRejectionReason", "subcategory", "title", "valueEstimate") SELECT "category", "city", "createdAt", "deposit", "description", "id", "lat", "lng", "ownerId", "pickupNote", "pricePerDay", "rules", "status", "statusRejectionReason", "subcategory", "title", "valueEstimate" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");
CREATE INDEX "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");
CREATE INDEX "Listing_status_pricePerDay_idx" ON "Listing"("status", "pricePerDay");
CREATE INDEX "Listing_category_subcategory_status_createdAt_idx" ON "Listing"("category", "subcategory", "status", "createdAt");
CREATE TABLE "new_PickupChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "accessoriesConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "conditionConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PickupChecklist_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PickupChecklist" ("accessoriesConfirmed", "bookingId", "completedAt", "conditionConfirmed", "createdAt", "id", "notes", "updatedAt") SELECT "accessoriesConfirmed", "bookingId", "completedAt", "conditionConfirmed", "createdAt", "id", "notes", "updatedAt" FROM "PickupChecklist";
DROP TABLE "PickupChecklist";
ALTER TABLE "new_PickupChecklist" RENAME TO "PickupChecklist";
CREATE UNIQUE INDEX "PickupChecklist_bookingId_key" ON "PickupChecklist"("bookingId");
CREATE TABLE "new_ReturnChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "conditionConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "damageReported" BOOLEAN NOT NULL DEFAULT false,
    "missingItemsReported" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReturnChecklist_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReturnChecklist" ("bookingId", "completedAt", "conditionConfirmed", "createdAt", "damageReported", "id", "missingItemsReported", "notes", "updatedAt") SELECT "bookingId", "completedAt", "conditionConfirmed", "createdAt", "damageReported", "id", "missingItemsReported", "notes", "updatedAt" FROM "ReturnChecklist";
DROP TABLE "ReturnChecklist";
ALTER TABLE "new_ReturnChecklist" RENAME TO "ReturnChecklist";
CREATE UNIQUE INDEX "ReturnChecklist_bookingId_key" ON "ReturnChecklist"("bookingId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "image" TEXT,
    "phoneNumber" TEXT,
    "city" TEXT,
    "kycStatus" TEXT DEFAULT 'PENDING',
    "kycSelfieUrl" TEXT,
    "kycIdUrl" TEXT,
    "kycSubmittedAt" DATETIME,
    "kycRejectedReason" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" DATETIME,
    "suspensionReason" TEXT,
    "termsAcceptedVersion" TEXT,
    "termsAcceptedAt" DATETIME,
    "privacyAcceptedVersion" TEXT,
    "privacyAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("city", "createdAt", "email", "id", "image", "isAdmin", "kycIdUrl", "kycRejectedReason", "kycSelfieUrl", "kycStatus", "kycSubmittedAt", "name", "phoneNumber", "suspendedAt", "suspensionReason") SELECT "city", coalesce("createdAt", CURRENT_TIMESTAMP) AS "createdAt", "email", "id", "image", "isAdmin", "kycIdUrl", "kycRejectedReason", "kycSelfieUrl", "kycStatus", "kycSubmittedAt", "name", "phoneNumber", "suspendedAt", "suspensionReason" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_kycStatus_createdAt_idx" ON "User"("kycStatus", "createdAt");
CREATE INDEX "User_suspendedAt_idx" ON "User"("suspendedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_createdAt_idx" ON "AnalyticsEvent"("eventName", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_bookingId_idx" ON "AnalyticsEvent"("bookingId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AdminActionRecord_bookingId_createdAt_idx" ON "AdminActionRecord"("bookingId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionRecord_disputeId_createdAt_idx" ON "AdminActionRecord"("disputeId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionRecord_adminUserId_createdAt_idx" ON "AdminActionRecord"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_status_createdAt_idx" ON "SupportTicket"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SystemAlert_level_createdAt_idx" ON "SystemAlert"("level", "createdAt");

-- CreateIndex
CREATE INDEX "SystemAlert_source_createdAt_idx" ON "SystemAlert"("source", "createdAt");
