-- CreateTable
CREATE TABLE "PickupChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "accessoriesConfirmed" INTEGER NOT NULL DEFAULT 0,
    "conditionConfirmed" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PickupChecklist_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingChecklistPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingChecklistPhoto_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PickupChecklist_bookingId_key" ON "PickupChecklist"("bookingId");
CREATE INDEX "BookingChecklistPhoto_bookingId_idx" ON "BookingChecklistPhoto"("bookingId");
CREATE UNIQUE INDEX "BookingChecklistPhoto_bookingId_type_angle_key" ON "BookingChecklistPhoto"("bookingId", "type", "angle");
