import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { datesOverlap } from "@/lib/availability";
import { getBookingSummary } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/admin";
import { needsOnboarding } from "@/lib/auth/onboarding";
import { generateUniqueBookingRef } from "@/lib/booking-ref";
import { sendBookingRequestedEmails } from "@/lib/notifications/booking-lifecycle";

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

  // Overlap check: existing bookings and blocked ranges
  const [existingBookings, blockedRanges] = await Promise.all([
    prisma.booking.findMany({
      where: { listingId: body.listingId },
      select: { startDate: true, endDate: true },
    }),
    prisma.listingBlockedRange.findMany({
      where: { listingId: body.listingId },
      select: { startDate: true, endDate: true },
    }),
  ]);

  const overlapsBooking = existingBookings.some((b) =>
    datesOverlap(startDate, endDate, b.startDate, b.endDate)
  );
  if (overlapsBooking) {
    return NextResponse.json(
      { error: "התאריכים שנבחרו חופפים להזמנה קיימת. נא לבחור תאריכים אחרים." },
      { status: 409 }
    );
  }

  const overlapsBlocked = blockedRanges.some((r) =>
    datesOverlap(startDate, endDate, r.startDate, r.endDate)
  );
  if (overlapsBlocked) {
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
      },
    });
    await tx.conversation.create({
      data: { bookingId: b.id },
    });
    return b;
  });

  await sendBookingRequestedEmails(booking.id);

  return NextResponse.json({ bookingId: booking.id });
}
