import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBookingSummary } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { generateUniqueBookingRef } from "@/lib/booking-ref";
import { sendBookingRequestedEmails } from "@/lib/notifications/booking-lifecycle";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

const OVERLAP_STATUS_SET: BookingStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "ACTIVE",
];

const OVERLAP_STATUS_FALLBACK: BookingStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "ACTIVE",
];

const ACTIVE_BOOKINGS_STATUS_SET: BookingStatus[] = [
  "REQUESTED",
  "ACTIVE",
  "CONFIRMED",
];

const ACTIVE_BOOKINGS_STATUS_FALLBACK: BookingStatus[] = [
  "REQUESTED",
  "ACTIVE",
  "CONFIRMED",
];

function logBookingCreateError(
  stage: string,
  error: unknown,
  context: {
    userId: string;
    listingId?: string;
    startDate?: string;
    endDate?: string;
    bookingId?: string;
    bookingRef?: string;
  }
) {
  const meta =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? { prismaCode: error.code, prismaMeta: error.meta }
      : {};

  console.error(`[booking-create] ${stage}`, {
    ...context,
    ...meta,
    error,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to create a booking", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }
  if (user.suspendedAt) {
    return NextResponse.json(
      { error: "החשבון מושעה זמנית ולא ניתן ליצור הזמנות.", code: "ACCOUNT_SUSPENDED" },
      { status: 403 }
    );
  }

  let body: {
    listingId: string;
    startDate: string;
    endDate: string;
  };
  try {
    body = (await req.json()) as {
      listingId: string;
      startDate: string;
      endDate: string;
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!body?.listingId || !body?.startDate || !body?.endDate) {
    return NextResponse.json(
      { error: "Missing required fields: listingId, startDate, endDate" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: body.listingId },
    select: { id: true, status: true, pricePerDay: true, deposit: true, pickupNote: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "המודעה אינה זמינה להזמנה כרגע (סטטוס: לא פעיל או ממתין לאישור)." },
      { status: 403 }
    );
  }

  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return NextResponse.json(
      { error: "תאריכי ההזמנה לא תקינים" },
      { status: 400 }
    );
  }

  // Overlap check: protect against enum drift between code and DB.
  let overlappingBooking;
  let overlappingBlockedRange;
  try {
    [overlappingBooking, overlappingBlockedRange] = await Promise.all([
      prisma.booking.findFirst({
        where: {
          listingId: body.listingId,
          status: { in: OVERLAP_STATUS_SET },
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        select: { id: true },
      }),
      prisma.listingBlockedRange.findFirst({
        where: {
          listingId: body.listingId,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        select: { id: true },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2007"
    ) {
      [overlappingBooking, overlappingBlockedRange] = await Promise.all([
        prisma.booking.findFirst({
          where: {
            listingId: body.listingId,
            status: { in: OVERLAP_STATUS_FALLBACK },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          select: { id: true },
        }),
        prisma.listingBlockedRange.findFirst({
          where: {
            listingId: body.listingId,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          select: { id: true },
        }),
      ]);
    } else {
      throw error;
    }
  }

  if (overlappingBooking) {
    return NextResponse.json(
      { error: "התאריכים שנבחרו חופפים להזמנה קיימת. נא לבחור תאריכים אחרים." },
      { status: 409 }
    );
  }

  if (overlappingBlockedRange) {
    return NextResponse.json(
      { error: "התאריכים שנבחרו חסומים. נא לבחור תאריכים זמינים." },
      { status: 409 }
    );
  }

  // Check KYC status - only allow booking if APPROVED
  if (user.kycStatus !== "APPROVED") {
    const statusMessages: Record<string, string> = {
      PENDING: "נדרש אימות זהות להשלמת הזמנה. אנא השלם את תהליך אימות הזהות בפרופיל שלך.",
      IN_PROGRESS: "נדרש אימות זהות להשלמת הזמנה. אנא השלם את תהליך אימות הזהות בפרופיל שלך.",
      SUBMITTED: "אימות הזהות שלך בתהליך בדיקה. נא להמתין לאישור לפני יצירת הזמנה.",
      REJECTED: user.kycRejectedReason 
        ? `אימות הזהות נדחה: ${user.kycRejectedReason}. אנא שלח מחדש את המסמכים.`
        : "אימות הזהות נדחה. אנא שלח מחדש את המסמכים.",
    };

    return NextResponse.json(
      { 
        error: statusMessages[user.kycStatus || "PENDING"] || "נדרש אימות זהות להשלמת הזמנה.",
        kycStatus: user.kycStatus,
        kycRejectedReason: user.kycRejectedReason,
      },
      { status: 403 }
    );
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let recentRequestsByUser: number;
  let activeBookingsByUser: number;
  let duplicatePendingOnListing: number;
  try {
    [recentRequestsByUser, activeBookingsByUser, duplicatePendingOnListing] = await Promise.all([
      prisma.booking.count({
        where: {
          userId: user.id,
          createdAt: { gte: oneDayAgo },
          status: { in: ["REQUESTED", "CONFIRMED"] },
        },
      }),
      prisma.booking.count({
        where: {
          userId: user.id,
          status: { in: ACTIVE_BOOKINGS_STATUS_SET },
        },
      }),
      prisma.booking.count({
        where: {
          userId: user.id,
          listingId: body.listingId,
          status: { in: ["REQUESTED", "CONFIRMED"] },
          endDate: { gte: now },
        },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2007"
    ) {
      [recentRequestsByUser, activeBookingsByUser, duplicatePendingOnListing] = await Promise.all([
        prisma.booking.count({
          where: {
            userId: user.id,
            createdAt: { gte: oneDayAgo },
            status: { in: ["REQUESTED", "CONFIRMED"] },
          },
        }),
        prisma.booking.count({
          where: {
            userId: user.id,
            status: { in: ACTIVE_BOOKINGS_STATUS_FALLBACK },
          },
        }),
        prisma.booking.count({
          where: {
            userId: user.id,
            listingId: body.listingId,
            status: { in: ["REQUESTED", "CONFIRMED"] },
            endDate: { gte: now },
          },
        }),
      ]);
    } else {
      throw error;
    }
  }

  if (recentRequestsByUser >= 8) {
    return NextResponse.json(
      { error: "בוצעו יותר מדי בקשות הזמנה ב-24 השעות האחרונות.", code: "RISK_VELOCITY_LIMIT" },
      { status: 429 }
    );
  }
  if (activeBookingsByUser >= 6) {
    return NextResponse.json(
      { error: "נדרש לסיים הזמנות פתוחות לפני יצירת הזמנה חדשה.", code: "RISK_ACTIVE_BOOKINGS_LIMIT" },
      { status: 409 }
    );
  }
  if (duplicatePendingOnListing > 0) {
    return NextResponse.json(
      { error: "כבר קיימת בקשה פתוחה עבור מודעה זו.", code: "RISK_DUPLICATE_PENDING" },
      { status: 409 }
    );
  }

  const summary = getBookingSummary({
    pricePerDay: listing.pricePerDay,
    deposit: listing.deposit,
    startDate,
    endDate,
  });

  const bookingRef = await generateUniqueBookingRef();

  const createBooking = async (withoutRiskFlagged = false) =>
    prisma.$transaction(async (tx) => {
      const bookingData = {
        id: randomUUID(),
        bookingRef,
        userId: user.id,
        listingId: body.listingId,
        startDate,
        endDate,
        status: "REQUESTED" as const,
        rentalSubtotal: summary.rentalSubtotal,
        serviceFee: summary.serviceFee,
        depositAmount: summary.depositAmount,
        totalDue: summary.totalDue,
        pickupInstructionsSnapshot: listing.pickupNote?.trim() || null,
      };
      const b = withoutRiskFlagged
        ? await tx.$queryRaw<Array<{ id: string }>>`
            INSERT INTO "Booking" (
              "id",
              "bookingRef",
              "userId",
              "listingId",
              "startDate",
              "endDate",
              "status",
              "rentalSubtotal",
              "serviceFee",
              "depositAmount",
              "totalDue",
              "pickupInstructionsSnapshot"
            )
            VALUES (
              ${bookingData.id},
              ${bookingData.bookingRef},
              ${bookingData.userId},
              ${bookingData.listingId},
              ${bookingData.startDate},
              ${bookingData.endDate},
              ${bookingData.status},
              ${bookingData.rentalSubtotal},
              ${bookingData.serviceFee},
              ${bookingData.depositAmount},
              ${bookingData.totalDue},
              ${bookingData.pickupInstructionsSnapshot}
            )
            RETURNING "id"
          `
        : await tx.booking.create({
            data: {
              ...bookingData,
              riskFlagged: false,
            },
          });

      const bookingId = Array.isArray(b) ? b[0]?.id : b.id;
      if (!bookingId) {
        throw new Error("Legacy booking insert did not return an id");
      }

      await tx.conversation.create({
        data: { bookingId },
      });
      return { id: bookingId };
    });

  let booking;
  try {
    booking = await createBooking(false);
  } catch (error) {
    const shouldRetryWithoutRiskFlag =
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2022" || error.code === "P2010" || error.code === "P2000")) ||
      (error instanceof Error && error.message.includes("riskFlagged"));

    if (!shouldRetryWithoutRiskFlag) {
      logBookingCreateError("transaction_failed", error, {
        userId: user.id,
        listingId: body.listingId,
        startDate: body.startDate,
        endDate: body.endDate,
        bookingRef,
      });
      return NextResponse.json(
        { error: "שגיאה ביצירת הזמנה. נסו שוב בעוד רגע." },
        { status: 500 }
      );
    }

    try {
      booking = await createBooking(true);
    } catch (retryError) {
      logBookingCreateError("transaction_retry_without_risk_flagged_failed", retryError, {
        userId: user.id,
        listingId: body.listingId,
        startDate: body.startDate,
        endDate: body.endDate,
        bookingRef,
      });
      return NextResponse.json(
        { error: "שגיאה ביצירת הזמנה. נסו שוב בעוד רגע." },
        { status: 500 }
      );
    }
  }

  // Non-critical side effects must never block checkout progression.
  const sideEffects = await Promise.allSettled([
    sendBookingRequestedEmails(booking.id),
    trackEvent({
      eventName: "booking_started",
      bookingId: booking.id,
      userId: user.id,
      payload: { listingId: body.listingId },
    }),
  ]);
  sideEffects.forEach((result, index) => {
    if (result.status === "fulfilled") return;
    const stage = index === 0 ? "email_failed" : "analytics_failed";
    logBookingCreateError(stage, result.reason, {
      userId: user.id,
      listingId: body.listingId,
      startDate: body.startDate,
      endDate: body.endDate,
      bookingId: booking.id,
      bookingRef,
    });
  });

  return NextResponse.json({ bookingId: booking.id });
}
