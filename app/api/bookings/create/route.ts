import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBookingSummary } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { generateUniqueBookingRef } from "@/lib/booking-ref";
import { sendBookingRequestedEmails } from "@/lib/notifications/booking-lifecycle";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

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

  const body = (await req.json()) as {
    listingId: string;
    startDate: string;
    endDate: string;
  };

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

  // Overlap check: push date conflict logic into DB.
  const [overlappingBooking, overlappingBlockedRange] = await Promise.all([
    prisma.booking.findFirst({
      where: {
        listingId: body.listingId,
        status: {
          in: [
            "REQUESTED",
            "CONFIRMED",
            "ACTIVE",
            "RETURNED",
            "IN_DISPUTE",
            "NON_RETURN_PENDING",
            "NON_RETURN_CONFIRMED",
          ],
        },
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
  const [recentRequestsByUser, activeBookingsByUser, duplicatePendingOnListing] = await Promise.all([
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
        status: { in: ["ACTIVE", "CONFIRMED", "RETURNED", "IN_DISPUTE", "NON_RETURN_PENDING"] },
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

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        bookingRef,
        userId: user.id,
        listingId: body.listingId,
        startDate,
        endDate,
        status: "REQUESTED",
        rentalSubtotal: summary.rentalSubtotal,
        serviceFee: summary.serviceFee,
        depositAmount: summary.depositAmount,
        totalDue: summary.totalDue,
        pickupInstructionsSnapshot: listing.pickupNote?.trim() || null,
        riskFlagged: false,
      },
    });
    await tx.conversation.create({
      data: { bookingId: b.id },
    });
    return b;
  });

  await sendBookingRequestedEmails(booking.id);
  await trackEvent({
    eventName: "booking_started",
    bookingId: booking.id,
    userId: user.id,
    payload: { listingId: body.listingId },
  });

  return NextResponse.json({ bookingId: booking.id });
}
