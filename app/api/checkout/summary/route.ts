import { NextResponse } from "next/server";
import { requireBookingAccess } from "@/lib/booking-auth";
import { getPaymentSnapshot } from "@/lib/payments/adapter";
import { needsOnboarding } from "@/lib/auth/onboarding";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { bookingId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const bookingId = body?.bookingId;
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const { error: authError, user } = await requireBookingAccess(bookingId);
  if (authError) return authError;
  if (user && needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to view checkout", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  const snapshot = await getPaymentSnapshot(bookingId);
  if (!snapshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    bookingId: snapshot.bookingId,
    bookingRef: snapshot.bookingRef ?? undefined,
    title: snapshot.title,
    startDate: snapshot.startDate,
    endDate: snapshot.endDate,
    rentalSubtotal: snapshot.rentalSubtotal,
    depositAmount: snapshot.depositAmount,
    serviceFee: snapshot.serviceFee,
    totalDue: snapshot.totalDue,
    lenderPayout: snapshot.lenderPayout,
    paymentStatus: snapshot.paymentStatus,
    paymentMethod: snapshot.paymentMethod ?? undefined,
    paymentLink: snapshot.paymentLink ?? undefined,
  });
}
