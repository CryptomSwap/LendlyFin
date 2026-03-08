-- CreateTable
CREATE TABLE "ReturnChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "conditionConfirmed" INTEGER NOT NULL DEFAULT 0,
    "damageReported" INTEGER NOT NULL DEFAULT 0,
    "missingItemsReported" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReturnChecklist_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnChecklist_bookingId_key" ON "ReturnChecklist"("bookingId");
