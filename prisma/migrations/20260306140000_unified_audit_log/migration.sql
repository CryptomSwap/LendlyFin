-- CreateTable: unified AuditLog for KYC, listing moderation, user suspension, disputes, overrides
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "reason" TEXT,
    "targetDisplayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_entityType_createdAt_idx" ON "AuditLog"("entityType", "createdAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Migrate existing KYC audit entries (userId = admin, targetUserId = entity)
INSERT INTO "AuditLog" ("id", "entityType", "entityId", "action", "adminUserId", "adminName", "reason", "targetDisplayName", "createdAt")
SELECT "id", 'KYC', "targetUserId", "action", "userId", "adminName", "reason", "targetUserName", "createdAt" FROM "KYCAuditLog";

-- Migrate existing listing moderation entries
INSERT INTO "AuditLog" ("id", "entityType", "entityId", "action", "adminUserId", "adminName", "reason", "targetDisplayName", "createdAt")
SELECT "id", 'LISTING', "listingId", "action", "adminUserId", "adminName", "reason", NULL, "createdAt" FROM "ListingModerationLog";

-- DropTable (after data migrated)
PRAGMA foreign_keys=off;
DROP TABLE "KYCAuditLog";
DROP TABLE "ListingModerationLog";
PRAGMA foreign_keys=on;
