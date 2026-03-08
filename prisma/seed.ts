import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { getBookingSummary } from "../lib/pricing";
import {
  QA_USER_IDS,
  QA_LISTING_IDS,
  QA_BOOKING_IDS,
  QA_DISPUTE_IDS,
} from "../lib/dev/qa-scenarios";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

/** Deterministic city coords for QA (no jitter). */
function cityCoords(city: string) {
  const c = city.trim();
  if (c === "תל אביב") return { lat: 32.0853, lng: 34.7818 };
  if (c === "ירושלים") return { lat: 31.7683, lng: 35.2137 };
  if (c === "חיפה") return { lat: 32.794, lng: 34.9896 };
  return { lat: 32.0853, lng: 34.7818 };
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80";
const PICKUP_RETURN_ANGLES = ["front", "side", "accessories"] as const;

async function main() {
  // Reset in dependency order (no cascade on deleteMany)
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingChecklistPhoto.deleteMany();
  await prisma.pickupChecklist.deleteMany();
  await prisma.returnChecklist.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingBlockedRange.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users (personas) ----
  await prisma.user.createMany({
    data: [
      { id: QA_USER_IDS.ADMIN, name: "Admin User", isAdmin: true },
      {
        id: "qa-admin-email",
        email: "admin@lendly.test",
        name: "Admin",
        isAdmin: true,
        phoneNumber: "0500000000",
        city: "תל אביב",
        kycStatus: "APPROVED",
      },
      {
        id: "qa-lender-email",
        email: "lender@lendly.test",
        name: "Test Lender",
        isAdmin: false,
        phoneNumber: "0500000001",
        city: "תל אביב",
        kycStatus: "APPROVED",
      },
      {
        id: "qa-renter-email",
        email: "renter@lendly.test",
        name: "Test Renter",
        isAdmin: false,
        phoneNumber: "0500000002",
        city: "ירושלים",
        kycStatus: "PENDING",
      },
      {
        id: QA_USER_IDS.DEV_LENDER,
        name: "Dev Lender",
        isAdmin: false,
        phoneNumber: "0501111111",
        city: "תל אביב",
        kycStatus: "APPROVED",
      },
      {
        id: QA_USER_IDS.RENTER_MULTI_BOOKING,
        name: "QA Renter",
        phoneNumber: "0502222222",
        city: "ירושלים",
        kycStatus: "APPROVED",
      },
      {
        id: QA_USER_IDS.RENTER_NO_BOOKINGS,
        name: "QA Renter No Bookings",
        phoneNumber: "0503333333",
        city: "חיפה",
        kycStatus: "APPROVED",
      },
      {
        id: QA_USER_IDS.OWNER_APPROVED,
        name: "QA Owner Approved",
        phoneNumber: "0504444444",
        city: "תל אביב",
        kycStatus: "APPROVED",
      },
      {
        id: QA_USER_IDS.OWNER_PENDING_KYC,
        name: "QA Owner Pending KYC",
        phoneNumber: "0505555555",
        city: "תל אביב",
        kycStatus: "SUBMITTED",
        kycSelfieUrl: "https://example.com/kyc/selfie-placeholder.jpg",
        kycIdUrl: "https://example.com/kyc/id-placeholder.jpg",
        kycSubmittedAt: new Date(),
      },
      {
        id: QA_USER_IDS.ONBOARDING_INCOMPLETE,
        name: "QA Onboarding Incomplete",
        phoneNumber: "",
        city: null,
        kycStatus: "PENDING",
      },
      {
        id: QA_USER_IDS.KYC_SUBMITTED,
        name: "QA KYC Submitted",
        phoneNumber: "0506666666",
        city: "ירושלים",
        kycStatus: "SUBMITTED",
        kycSelfieUrl: "https://example.com/kyc/selfie.jpg",
        kycIdUrl: "https://example.com/kyc/id.jpg",
        kycSubmittedAt: new Date(),
      },
      {
        id: QA_USER_IDS.KYC_REJECTED,
        name: "QA KYC Rejected",
        phoneNumber: "0507777777",
        city: "חיפה",
        kycStatus: "REJECTED",
        kycRejectedReason: "Document blur; please resubmit a clear photo.",
        kycSelfieUrl: "https://example.com/kyc/rejected-selfie.jpg",
        kycIdUrl: "https://example.com/kyc/rejected-id.jpg",
      },
    ],
  });

  // ---- Listings (8+; multiple categories, cities, statuses) ----
  const telAviv = cityCoords("תל אביב");
  const jerusalem = cityCoords("ירושלים");
  const haifa = cityCoords("חיפה");

  await prisma.listing.createMany({
    data: [
      {
        id: QA_LISTING_IDS.SONY_CAMERA,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: "מצלמת Sony A7",
        description: "מצלמת מירורלס מקצועית.",
        pricePerDay: 150,
        deposit: 800,
        city: "תל אביב",
        category: "camera",
        status: "ACTIVE",
        lat: telAviv.lat,
        lng: telAviv.lng,
      },
      {
        id: QA_LISTING_IDS.TENT,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: "אוהל קמפינג",
        description: "אוהל 4 אנשים.",
        pricePerDay: 80,
        deposit: 300,
        city: "תל אביב",
        category: "camping",
        status: "ACTIVE",
        lat: telAviv.lat,
        lng: telAviv.lng,
      },
      {
        id: QA_LISTING_IDS.DRILL,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: "מקדחה Bosch",
        description: "מקדחה אלחוטית.",
        pricePerDay: 60,
        deposit: 250,
        city: "תל אביב",
        category: "tools",
        status: "ACTIVE",
        lat: telAviv.lat,
        lng: telAviv.lng,
      },
      {
        id: QA_LISTING_IDS.BIKE,
        ownerId: QA_USER_IDS.OWNER_APPROVED,
        title: "אופני הרים",
        description: "אופני הרים ליום כיף.",
        pricePerDay: 70,
        deposit: 400,
        city: "ירושלים",
        category: "sports",
        status: "ACTIVE",
        lat: jerusalem.lat,
        lng: jerusalem.lng,
      },
      {
        id: QA_LISTING_IDS.LAPTOP,
        ownerId: QA_USER_IDS.OWNER_APPROVED,
        title: "מחשב נייד MacBook",
        description: "לעבודה וסטרימינג.",
        pricePerDay: 120,
        deposit: 2000,
        city: "תל אביב",
        category: "electronics",
        status: "ACTIVE",
        lat: telAviv.lat,
        lng: telAviv.lng,
      },
      {
        id: QA_LISTING_IDS.KAYAK,
        ownerId: QA_USER_IDS.OWNER_APPROVED,
        title: "קיאק זוגי",
        description: "קיאק לים או אגם.",
        pricePerDay: 100,
        deposit: 500,
        city: "חיפה",
        category: "sports",
        status: "ACTIVE",
        lat: haifa.lat,
        lng: haifa.lng,
      },
      {
        id: QA_LISTING_IDS.TABLE_PENDING,
        ownerId: QA_USER_IDS.OWNER_PENDING_KYC,
        title: "שולחן אירוח",
        description: "שולחן מתקפל.",
        pricePerDay: 30,
        deposit: 100,
        city: "תל אביב",
        category: "furniture",
        status: "PENDING_APPROVAL",
        lat: telAviv.lat,
        lng: telAviv.lng,
      },
      {
        id: QA_LISTING_IDS.CHAIR_REJECTED,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: "כיסא גלגלים",
        description: "כיסא משרדי.",
        pricePerDay: 20,
        deposit: 80,
        city: "ירושלים",
        category: "furniture",
        status: "REJECTED",
        statusRejectionReason: "Photo quality too low for approval.",
        lat: jerusalem.lat,
        lng: jerusalem.lng,
      },
      {
        id: QA_LISTING_IDS.PAUSED_SLEEPING_BAG,
        ownerId: QA_USER_IDS.DEV_LENDER,
        title: "שק שינה",
        description: "שק שינה עמיד מים.",
        pricePerDay: 25,
        deposit: 150,
        city: "חיפה",
        category: "camping",
        status: "PAUSED",
        lat: haifa.lat,
        lng: haifa.lng,
      },
    ],
  });

  // Listing images (mix of coverage: some with 2, some with 1)
  const listingImages: { listingId: string; url: string; order: number }[] = [
    { listingId: QA_LISTING_IDS.SONY_CAMERA, url: PLACEHOLDER_IMAGE, order: 0 },
    {
      listingId: QA_LISTING_IDS.SONY_CAMERA,
      url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      order: 1,
    },
    {
      listingId: QA_LISTING_IDS.TENT,
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80",
      order: 0,
    },
    {
      listingId: QA_LISTING_IDS.DRILL,
      url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
      order: 0,
    },
    { listingId: QA_LISTING_IDS.BIKE, url: PLACEHOLDER_IMAGE, order: 0 },
    { listingId: QA_LISTING_IDS.LAPTOP, url: PLACEHOLDER_IMAGE, order: 0 },
    { listingId: QA_LISTING_IDS.KAYAK, url: PLACEHOLDER_IMAGE, order: 0 },
    { listingId: QA_LISTING_IDS.TABLE_PENDING, url: PLACEHOLDER_IMAGE, order: 0 },
    { listingId: QA_LISTING_IDS.CHAIR_REJECTED, url: PLACEHOLDER_IMAGE, order: 0 },
    { listingId: QA_LISTING_IDS.PAUSED_SLEEPING_BAG, url: PLACEHOLDER_IMAGE, order: 0 },
  ];
  await prisma.listingImage.createMany({ data: listingImages });

  // ---- Bookings + Conversations ----
  const sonyListing = await prisma.listing.findUniqueOrThrow({
    where: { id: QA_LISTING_IDS.SONY_CAMERA },
    select: { pricePerDay: true, deposit: true },
  });
  const tentListing = await prisma.listing.findUniqueOrThrow({
    where: { id: QA_LISTING_IDS.TENT },
    select: { pricePerDay: true, deposit: true },
  });
  const drillListing = await prisma.listing.findUniqueOrThrow({
    where: { id: QA_LISTING_IDS.DRILL },
    select: { pricePerDay: true, deposit: true },
  });
  const bikeListing = await prisma.listing.findUniqueOrThrow({
    where: { id: QA_LISTING_IDS.BIKE },
    select: { pricePerDay: true, deposit: true },
  });

  const requestedSummary = getBookingSummary({
    pricePerDay: sonyListing.pricePerDay,
    deposit: sonyListing.deposit,
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-04-03"),
  });
  const confirmedSummary = getBookingSummary({
    pricePerDay: tentListing.pricePerDay,
    deposit: tentListing.deposit,
    startDate: new Date("2025-04-10"),
    endDate: new Date("2025-04-12"),
  });
  const activeSummary = getBookingSummary({
    pricePerDay: drillListing.pricePerDay,
    deposit: drillListing.deposit,
    startDate: new Date("2025-04-15"),
    endDate: new Date("2025-04-17"),
  });
  const completedSummary = getBookingSummary({
    pricePerDay: bikeListing.pricePerDay,
    deposit: bikeListing.deposit,
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-03-03"),
  });
  const disputeSummary = getBookingSummary({
    pricePerDay: sonyListing.pricePerDay,
    deposit: sonyListing.deposit,
    startDate: new Date("2025-03-10"),
    endDate: new Date("2025-03-12"),
  });

  // REQUESTED: PENDING payment, ready for admin confirm
  await prisma.booking.create({
    data: {
      id: QA_BOOKING_IDS.REQUESTED,
      userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: QA_LISTING_IDS.SONY_CAMERA,
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-04-03"),
      status: "REQUESTED",
      paymentStatus: "PENDING",
      depositStatus: "PENDING",
      rentalSubtotal: requestedSummary.rentalSubtotal,
      serviceFee: requestedSummary.serviceFee,
      depositAmount: requestedSummary.depositAmount,
      totalDue: requestedSummary.totalDue,
      bookingRef: "LND-QA01",
    },
  });
  await prisma.conversation.create({
    data: { bookingId: QA_BOOKING_IDS.REQUESTED },
  });

  // CONFIRMED: payment SUCCEEDED, deposit HELD, ready for pickup checklist
  await prisma.booking.create({
    data: {
      id: QA_BOOKING_IDS.CONFIRMED,
      userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: QA_LISTING_IDS.TENT,
      startDate: new Date("2025-04-10"),
      endDate: new Date("2025-04-12"),
      status: "CONFIRMED",
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      paymentConfirmedAt: new Date(),
      paymentConfirmedByAdminId: QA_USER_IDS.ADMIN,
      rentalSubtotal: confirmedSummary.rentalSubtotal,
      serviceFee: confirmedSummary.serviceFee,
      depositAmount: confirmedSummary.depositAmount,
      totalDue: confirmedSummary.totalDue,
      bookingRef: "LND-QA02",
    },
  });
  await prisma.conversation.create({
    data: { bookingId: QA_BOOKING_IDS.CONFIRMED },
  });

  // ACTIVE: pickup checklist done, ready for return checklist
  await prisma.booking.create({
    data: {
      id: QA_BOOKING_IDS.ACTIVE,
      userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: QA_LISTING_IDS.DRILL,
      startDate: new Date("2025-04-15"),
      endDate: new Date("2025-04-17"),
      status: "ACTIVE",
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      paymentConfirmedAt: new Date(),
      rentalSubtotal: activeSummary.rentalSubtotal,
      serviceFee: activeSummary.serviceFee,
      depositAmount: activeSummary.depositAmount,
      totalDue: activeSummary.totalDue,
      bookingRef: "LND-QA03",
    },
  });
  await prisma.conversation.create({
    data: { bookingId: QA_BOOKING_IDS.ACTIVE },
  });
  await prisma.pickupChecklist.create({
    data: {
      bookingId: QA_BOOKING_IDS.ACTIVE,
      accessoriesConfirmed: true,
      conditionConfirmed: true,
      completedAt: new Date(),
    },
  });
  for (const angle of PICKUP_RETURN_ANGLES) {
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId: QA_BOOKING_IDS.ACTIVE,
        type: "pickup",
        angle,
        url: `https://example.com/checklist/active-pickup-${angle}.jpg`,
      },
    });
  }

  // COMPLETED: return checklist done, deposit released
  await prisma.booking.create({
    data: {
      id: QA_BOOKING_IDS.COMPLETED,
      userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: QA_LISTING_IDS.BIKE,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-03"),
      status: "COMPLETED",
      paymentStatus: "SUCCEEDED",
      depositStatus: "RELEASED_RENTER",
      paymentConfirmedAt: new Date(),
      rentalSubtotal: completedSummary.rentalSubtotal,
      serviceFee: completedSummary.serviceFee,
      depositAmount: completedSummary.depositAmount,
      totalDue: completedSummary.totalDue,
      bookingRef: "LND-QA04",
    },
  });
  await prisma.conversation.create({
    data: { bookingId: QA_BOOKING_IDS.COMPLETED },
  });
  await prisma.pickupChecklist.create({
    data: {
      bookingId: QA_BOOKING_IDS.COMPLETED,
      accessoriesConfirmed: true,
      conditionConfirmed: true,
      completedAt: new Date(),
    },
  });
  await prisma.returnChecklist.create({
    data: {
      bookingId: QA_BOOKING_IDS.COMPLETED,
      conditionConfirmed: true,
      damageReported: false,
      missingItemsReported: false,
      completedAt: new Date(),
    },
  });
  const completedBookingId = QA_BOOKING_IDS.COMPLETED;
  for (const angle of PICKUP_RETURN_ANGLES) {
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId: completedBookingId,
        type: "pickup",
        angle,
        url: `https://example.com/checklist/completed-pickup-${angle}.jpg`,
      },
    });
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId: completedBookingId,
        type: "return",
        angle,
        url: `https://example.com/checklist/completed-return-${angle}.jpg`,
      },
    });
  }

  // DISPUTE: dispute row, status DISPUTE, deposit HELD
  await prisma.booking.create({
    data: {
      id: QA_BOOKING_IDS.DISPUTE,
      userId: QA_USER_IDS.RENTER_MULTI_BOOKING,
      listingId: QA_LISTING_IDS.SONY_CAMERA,
      startDate: new Date("2025-03-10"),
      endDate: new Date("2025-03-12"),
      status: "DISPUTE",
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      paymentConfirmedAt: new Date(),
      rentalSubtotal: disputeSummary.rentalSubtotal,
      serviceFee: disputeSummary.serviceFee,
      depositAmount: disputeSummary.depositAmount,
      totalDue: disputeSummary.totalDue,
      bookingRef: "LND-QA05",
    },
  });
  await prisma.conversation.create({
    data: { bookingId: QA_BOOKING_IDS.DISPUTE },
  });
  await prisma.pickupChecklist.create({
    data: {
      bookingId: QA_BOOKING_IDS.DISPUTE,
      accessoriesConfirmed: true,
      conditionConfirmed: true,
      completedAt: new Date(),
    },
  });
  await prisma.returnChecklist.create({
    data: {
      bookingId: QA_BOOKING_IDS.DISPUTE,
      conditionConfirmed: true,
      damageReported: true,
      missingItemsReported: false,
      completedAt: new Date(),
    },
  });
  await prisma.dispute.create({
    data: {
      id: QA_DISPUTE_IDS.OPEN,
      bookingId: QA_BOOKING_IDS.DISPUTE,
      reason: "damage",
      status: "OPEN",
      openedByUserId: QA_USER_IDS.RENTER_MULTI_BOOKING,
    },
  });
  for (const angle of PICKUP_RETURN_ANGLES) {
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId: QA_BOOKING_IDS.DISPUTE,
        type: "pickup",
        angle,
        url: `https://example.com/checklist/dispute-pickup-${angle}.jpg`,
      },
    });
    await prisma.bookingChecklistPhoto.create({
      data: {
        bookingId: QA_BOOKING_IDS.DISPUTE,
        type: "return",
        angle,
        url: `https://example.com/checklist/dispute-return-${angle}.jpg`,
      },
    });
  }

  // ---- Messages (booking-scoped conversations) ----
  const convRequested = await prisma.conversation.findUniqueOrThrow({
    where: { bookingId: QA_BOOKING_IDS.REQUESTED },
  });
  const convCompleted = await prisma.conversation.findUniqueOrThrow({
    where: { bookingId: QA_BOOKING_IDS.COMPLETED },
  });
  const convDispute = await prisma.conversation.findUniqueOrThrow({
    where: { bookingId: QA_BOOKING_IDS.DISPUTE },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convRequested.id,
        senderId: QA_USER_IDS.RENTER_MULTI_BOOKING,
        body: "היי, אפשר לאסוף מוקדם בבוקר?",
      },
      {
        conversationId: convRequested.id,
        senderId: QA_USER_IDS.DEV_LENDER,
        body: "בסדר, מ-8:00 זה בסדר.",
      },
      {
        conversationId: convCompleted.id,
        senderId: QA_USER_IDS.RENTER_MULTI_BOOKING,
        body: "תודה על ההשאלה, היה מעולה.",
      },
      {
        conversationId: convDispute.id,
        senderId: QA_USER_IDS.RENTER_MULTI_BOOKING,
        body: "יש נזק קטן לרצועה, מצרף תמונות.",
      },
    ],
  });

  // ---- Reviews (completed booking only; uniqueness: bookingId + authorId) ----
  const bikeListingRow = await prisma.listing.findUniqueOrThrow({
    where: { id: QA_LISTING_IDS.BIKE },
    select: { ownerId: true },
  });
  const ownerId = bikeListingRow.ownerId!;
  await prisma.review.createMany({
    data: [
      {
        bookingId: QA_BOOKING_IDS.COMPLETED,
        authorId: QA_USER_IDS.RENTER_MULTI_BOOKING,
        targetUserId: ownerId,
        rating: 5,
        body: "ממליץ בחום, האופניים במצב מעולה.",
      },
      {
        bookingId: QA_BOOKING_IDS.COMPLETED,
        authorId: ownerId,
        targetUserId: QA_USER_IDS.RENTER_MULTI_BOOKING,
        rating: 5,
        body: "שומר מצוין, החזיר בזמן.",
      },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
