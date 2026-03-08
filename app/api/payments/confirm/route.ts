import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments/adapter";
import { requireBookingAccess } from "@/lib/booking-auth";

export const runtime = "nodejs";

const MANUAL_BIT_ENABLED = !!(
  typeof process.env.MANUAL_BIT_PAYMENT_URL === "string" &&
  process.env.MANUAL_BIT_PAYMENT_URL.trim().length > 0
);

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

  const { error: authError, booking } = await requireBookingAccess(bookingId);
  if (authError) return authError;
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (MANUAL_BIT_ENABLED || booking.paymentMethod === "MANUAL_BIT") {
    return NextResponse.json(
      {
        error: "Payment is confirmed manually by admin",
        code: "MANUAL_PAYMENT_CONFIRM_REQUIRED",
      },
      { status: 403 }
    );
  }

  const result = await confirmPayment(bookingId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, bookingId: result.bookingId });
}
