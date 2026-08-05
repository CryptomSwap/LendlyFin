/**
 * Seed realistic multi-status bookings for the multi-booking renter persona.
 * Non-destructive: only rewrites bookings belonging to QA_USER_IDS.RENTER_MULTI_BOOKING.
 *
 * Run:
 *   npm run db:seed-mock-bookings
 */

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getBookingSummary } from "../lib/pricing";
import { QA_USER_IDS } from "../lib/dev/qa-scenarios";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80";
const CHECKLIST_ANGLES = ["front", "side", "accessories"] as const;

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function ensureBaseUsers() {
  await prisma.user.upsert({
    where: { id: QA_USER_IDS.DEV_LENDER },
    update: {
      name: "Dev Lender",
      city: "תל אביב",
      phoneNumber: "0501111111",
      kycStatus: "APPROVED",
    },
    create: {
      id: QA_USER_IDS.DEV_LENDER,
      name: "Dev Lender",
      city: "תל אביב",
      phoneNumber: "0501111111",
      kycStatus: "APPROVED",
    },
  });

  await prisma.user.upsert({
    where: { id: QA_USER_IDS.RENTER_MULTI_BOOKING },
    update: {
      name: "QA Renter",
      city: "ירושלים",
      phoneNumber: "0502222222",
      kycStatus: "APPROVED",
    },
    create: {
      id: QA_USER_IDS.RENTER_MULTI_BOOKING,
      name: "QA Renter",
      city: "ירושלים",
      phoneNumber: "0502222222",
      kycStatus: "APPROVED",
    },
  });

  await prisma.user.upsert({
    where: { id: QA_USER_IDS.OWNER_APPROVED },
    update: {
      name: "QA Owner Approved",
      city: "תל אביב",
      phoneNumber: "0504444444",
      kycStatus: "APPROVED",
    },
    create: {
      id: QA_USER_IDS.OWNER_APPROVED,
      name: "QA Owner Approved",
      city: "תל אביב",
      phoneNumber: "0504444444",
      kycStatus: "APPROVED",
    },
  });
}

async function ensureListings() {
  const listings = [
    {
      id: "mock-listing-camera",
      title: "מצלמת Sony A7 IV",
      description: "מצלמת מירורלס מקצועית לצילום אירועים ותוכן.",
      pricePerDay: 180,
      deposit: 1200,
      category: "camera",
      city: "תל אביב",
      lat: 32.0853,
      lng: 34.7818,
    },
    {
      id: "mock-listing-camping",
      title: "ערכת קמפינג מלאה",
      description: "אוהל, שקי שינה וערכת בישול לשטח.",
      pricePerDay: 95,
      deposit: 450,
      category: "camping",
      city: "ירושלים",
      lat: 31.7683,
      lng: 35.2137,
    },
    {
      id: "mock-listing-tools",
      title: "מקדחה Bosch Pro",
      description: "מקדחה אלחוטית עם 2 סוללות וסט ביטים.",
      pricePerDay: 70,
      deposit: 300,
      category: "tools",
      city: "חיפה",
      lat: 32.794,
      lng: 34.9896,
    },
  ] as const;

  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: {
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: listing.title,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        deposit: listing.deposit,
        city: listing.city,
        category: listing.category,
        status: "ACTIVE",
        lat: listing.lat,
        lng: listing.lng,
      },
      create: {
        id: listing.id,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: listing.title,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        deposit: listing.deposit,
        city: listing.city,
        category: listing.category,
        status: "ACTIVE",
        lat: listing.lat,
        lng: listing.lng,
      },
    });

    const existingImages = await prisma.listingImage.count({
      where: { listingId: listing.id },
    });
    if (existingImages === 0) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: PLACEHOLDER_IMAGE,
          order: 0,
        },
      });
    }
  }

  const ownerApprovedListings = [
    {
      id: "mock-owner-listing-bike",
      title: "אופני עיר Premium",
      description: "אופניים עירוניים במצב מצוין ליום עבודה בעיר.",
      pricePerDay: 85,
      deposit: 450,
      category: "sports",
      city: "תל אביב",
      lat: 32.0853,
      lng: 34.7818,
    },
    {
      id: "mock-owner-listing-laptop",
      title: "MacBook Pro 14 להשכרה",
      description: "מחשב חזק לעריכה ועבודה מרחוק.",
      pricePerDay: 160,
      deposit: 1800,
      category: "electronics",
      city: "ירושלים",
      lat: 31.7683,
      lng: 35.2137,
    },
  ] as const;

  for (const listing of ownerApprovedListings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: {
        ownerId: QA_USER_IDS.OWNER_APPROVED,
        title: listing.title,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        deposit: listing.deposit,
        city: listing.city,
        category: listing.category,
        status: "ACTIVE",
        lat: listing.lat,
        lng: listing.lng,
      },
      create: {
        id: listing.id,
        ownerId: QA_USER_IDS.OWNER_APPROVED,
        title: listing.title,
        description: listing.description,
        pricePerDay: listing.pricePerDay,
        deposit: listing.deposit,
        city: listing.city,
        category: listing.category,
        status: "ACTIVE",
        lat: listing.lat,
        lng: listing.lng,
      },
    });

    const existingImages = await prisma.listingImage.count({
      where: { listingId: listing.id },
    });
    if (existingImages === 0) {
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: PLACEHOLDER_IMAGE,
          order: 0,
        },
      });
    }
  }
}

async function deleteExistingRenterBookings() {
  const renterBookings = await prisma.booking.findMany({
    where: { userId: QA_USER_IDS.RENTER_MULTI_BOOKING },
    select: { id: true },
  });
  const bookingIds = renterBookings.map((b) => b.id);
  if (bookingIds.length === 0) return;

  const conversations = await prisma.conversation.findMany({
    where: { bookingId: { in: bookingIds } },
    select: { id: true },
  });
  const conversationIds = conversations.map((c) => c.id);

  if (conversationIds.length > 0) {
    await prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
  }
  await prisma.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.bookingChecklistPhoto.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.pickupChecklist.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.returnChecklist.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.dispute.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.conversation.deleteMany({ where: { bookingId: { in: bookingIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
}

async function deleteBookingsByIds(ids: string[]) {
  if (ids.length === 0) return;
  const conversations = await prisma.conversation.findMany({
    where: { bookingId: { in: ids } },
    select: { id: true },
  });
  const conversationIds = conversations.map((c) => c.id);
  if (conversationIds.length > 0) {
    await prisma.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
  }
  await prisma.review.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.bookingChecklistPhoto.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.pickupChecklist.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.returnChecklist.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.dispute.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.conversation.deleteMany({ where: { bookingId: { in: ids } } });
  await prisma.booking.deleteMany({ where: { id: { in: ids } } });
}

async function createBooking(input: {
  id: string;
  listingId: string;
  userId?: string;
  startDate: Date;
  endDate: Date;
  status:
    | "REQUESTED"
    | "CONFIRMED"
    | "ACTIVE"
    | "RETURNED"
    | "IN_DISPUTE"
    | "NON_RETURN_PENDING"
    | "NON_RETURN_CONFIRMED"
    | "COMPLETED";
  paymentStatus: "PENDING" | "SUCCEEDED";
  depositStatus: "PENDING" | "HELD" | "RELEASED_RENTER";
  bookingRef: string;
  returnedAt?: Date;
  disputeWindowEndsAt?: Date;
}) {
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id: input.listingId },
    select: { pricePerDay: true, deposit: true },
  });
  const summary = getBookingSummary({
    pricePerDay: listing.pricePerDay,
    deposit: listing.deposit,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  await prisma.booking.create({
    data: {
      id: input.id,
      userId: input.userId ?? QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: input.listingId,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      paymentStatus: input.paymentStatus,
      depositStatus: input.depositStatus,
      paymentConfirmedAt: input.paymentStatus === "SUCCEEDED" ? new Date() : null,
      rentalSubtotal: summary.rentalSubtotal,
      serviceFee: summary.serviceFee,
      depositAmount: summary.depositAmount,
      totalDue: summary.totalDue,
      bookingRef: input.bookingRef,
      returnedAt: input.returnedAt ?? null,
      disputeWindowEndsAt: input.disputeWindowEndsAt ?? null,
    },
  });

  await prisma.conversation.create({
    data: { bookingId: input.id },
  });
}

async function createChecklists(bookingId: string, withReturn: boolean, hasIssue = false) {
  await prisma.pickupChecklist.create({
    data: {
      bookingId,
      accessoriesConfirmed: true,
      conditionConfirmed: true,
      notes: "נבדק מול בעל הפריט, הכל תקין באיסוף.",
      completedAt: new Date(),
    },
  });

  for (const angle of CHECKLIST_ANGLES) {
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId,
        type: "pickup",
        angle,
        url: `https://example.com/mock/${bookingId}-pickup-${angle}.jpg`,
      },
    });
  }

  if (!withReturn) return;

  await prisma.returnChecklist.create({
    data: {
      bookingId,
      conditionConfirmed: !hasIssue,
      damageReported: hasIssue,
      missingItemsReported: false,
      notes: hasIssue
        ? "התגלו סימני נזק קלים בעת החזרה."
        : "הוחזר בזמן ובמצב טוב.",
      completedAt: new Date(),
    },
  });

  for (const angle of CHECKLIST_ANGLES) {
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId,
        type: "return",
        angle,
        url: `https://example.com/mock/${bookingId}-return-${angle}.jpg`,
      },
    });
  }
}

async function main() {
  await ensureBaseUsers();
  await ensureListings();
  await deleteExistingRenterBookings();

  const now = new Date();

  // 1. Requested (awaiting manual payment confirmation)
  await createBooking({
    id: "mock-booking-requested",
    listingId: "mock-listing-camera",
    startDate: addDays(now, 7),
    endDate: addDays(now, 9),
    status: "REQUESTED",
    paymentStatus: "PENDING",
    depositStatus: "PENDING",
    bookingRef: "LND-MOCK01",
  });

  // 2. Confirmed (ready for pickup)
  await createBooking({
    id: "mock-booking-confirmed",
    listingId: "mock-listing-camping",
    startDate: addDays(now, 5),
    endDate: addDays(now, 6),
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK02",
  });

  // 3. Active (pickup done, awaiting return)
  await createBooking({
    id: "mock-booking-active",
    listingId: "mock-listing-tools",
    startDate: addDays(now, -1),
    endDate: addDays(now, 1),
    status: "ACTIVE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK03",
  });
  await createChecklists("mock-booking-active", false);

  // 3b. Active (second concurrent rental)
  await createBooking({
    id: "mock-booking-active-2",
    listingId: "mock-listing-camera",
    startDate: addDays(now, -3),
    endDate: addDays(now, 2),
    status: "ACTIVE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK08",
  });
  await createChecklists("mock-booking-active-2", false);

  // 3c. Active (third concurrent rental)
  await createBooking({
    id: "mock-booking-active-3",
    listingId: "mock-listing-camping",
    startDate: addDays(now, -2),
    endDate: addDays(now, 3),
    status: "ACTIVE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK09",
  });
  await createChecklists("mock-booking-active-3", false);

  // 4. Returned (inside dispute window)
  const returnedAt = addDays(now, -1);
  await createBooking({
    id: "mock-booking-returned",
    listingId: "mock-listing-camera",
    startDate: addDays(now, -4),
    endDate: addDays(now, -2),
    status: "RETURNED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK04",
    returnedAt,
    disputeWindowEndsAt: addDays(returnedAt, 2),
  });
  await createChecklists("mock-booking-returned", true);

  // 5. In dispute
  await createBooking({
    id: "mock-booking-dispute",
    listingId: "mock-listing-tools",
    startDate: addDays(now, -8),
    endDate: addDays(now, -6),
    status: "IN_DISPUTE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK05",
    returnedAt: addDays(now, -6),
    disputeWindowEndsAt: addDays(now, -4),
  });
  await createChecklists("mock-booking-dispute", true, true);
  await prisma.dispute.create({
    data: {
      bookingId: "mock-booking-dispute",
      reason: "damage",
      status: "OPEN",
      openedByUserId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      adminNote: "ממתין לבדיקת מנהל.",
    },
  });

  // 6. Non-return pending
  await createBooking({
    id: "mock-booking-nonreturn-pending",
    listingId: "mock-listing-camping",
    startDate: addDays(now, -10),
    endDate: addDays(now, -8),
    status: "NON_RETURN_PENDING",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-MOCK06",
  });
  await prisma.booking.update({
    where: { id: "mock-booking-nonreturn-pending" },
    data: {
      nonReturnMarkedAt: addDays(now, -7),
      nonReturnReason: "הפריט לא הוחזר במועד, אין מענה מהשוכר.",
    },
  });

  // 7. Completed
  await createBooking({
    id: "mock-booking-completed",
    listingId: "mock-listing-camera",
    startDate: addDays(now, -20),
    endDate: addDays(now, -18),
    status: "COMPLETED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "RELEASED_RENTER",
    bookingRef: "LND-MOCK07",
    returnedAt: addDays(now, -18),
    disputeWindowEndsAt: addDays(now, -16),
  });
  await createChecklists("mock-booking-completed", true);

  // Lender-perspective pipeline for qa-owner-approved (bookings on owner's listings)
  const ownerPipelineBookingIds = [
    "mock-owner-booking-requested",
    "mock-owner-booking-confirmed",
    "mock-owner-booking-active",
    "mock-owner-booking-returned",
    "mock-owner-booking-dispute",
    "mock-owner-booking-completed",
  ];
  await deleteBookingsByIds(ownerPipelineBookingIds);

  await createBooking({
    id: "mock-owner-booking-requested",
    listingId: "mock-owner-listing-bike",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, 3),
    endDate: addDays(now, 4),
    status: "REQUESTED",
    paymentStatus: "PENDING",
    depositStatus: "PENDING",
    bookingRef: "LND-OWN01",
  });

  await createBooking({
    id: "mock-owner-booking-confirmed",
    listingId: "mock-owner-listing-bike",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, 1),
    endDate: addDays(now, 2),
    status: "CONFIRMED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-OWN02",
  });

  await createBooking({
    id: "mock-owner-booking-active",
    listingId: "mock-owner-listing-laptop",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, -2),
    endDate: addDays(now, 1),
    status: "ACTIVE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-OWN03",
  });
  await createChecklists("mock-owner-booking-active", false);

  const ownerReturnedAt = addDays(now, -1);
  await createBooking({
    id: "mock-owner-booking-returned",
    listingId: "mock-owner-listing-bike",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, -6),
    endDate: addDays(now, -4),
    status: "RETURNED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-OWN04",
    returnedAt: ownerReturnedAt,
    disputeWindowEndsAt: addDays(ownerReturnedAt, 2),
  });
  await createChecklists("mock-owner-booking-returned", true);

  await createBooking({
    id: "mock-owner-booking-dispute",
    listingId: "mock-owner-listing-laptop",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, -10),
    endDate: addDays(now, -8),
    status: "IN_DISPUTE",
    paymentStatus: "SUCCEEDED",
    depositStatus: "HELD",
    bookingRef: "LND-OWN05",
    returnedAt: addDays(now, -8),
    disputeWindowEndsAt: addDays(now, -6),
  });
  await createChecklists("mock-owner-booking-dispute", true, true);
  await prisma.dispute.create({
    data: {
      bookingId: "mock-owner-booking-dispute",
      reason: "damage",
      status: "UNDER_REVIEW",
      openedByUserId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      adminNote: "ממתין להכרעת הנהלה.",
    },
  });

  await createBooking({
    id: "mock-owner-booking-completed",
    listingId: "mock-owner-listing-bike",
    userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    startDate: addDays(now, -18),
    endDate: addDays(now, -16),
    status: "COMPLETED",
    paymentStatus: "SUCCEEDED",
    depositStatus: "RELEASED_RENTER",
    bookingRef: "LND-OWN06",
    returnedAt: addDays(now, -16),
    disputeWindowEndsAt: addDays(now, -14),
  });
  await createChecklists("mock-owner-booking-completed", true);

  console.log("Created 9 mock bookings for renter:", QA_USER_IDS.RENTER_MULTI_BOOKING);
  console.log("Created 6 owner-pipeline bookings for:", QA_USER_IDS.OWNER_APPROVED);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

