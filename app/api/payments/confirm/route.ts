import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments/adapter";
import { requireBookingAccess } from "@/lib/booking-auth";
import { getPaymentProvider } from "@/lib/payments/provider";
import { forwardErrorIfConfigured, logApiError, logEvent } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
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

    if (
      getPaymentProvider() === "mangopay" ||
      booking.paymentMethod === "MANGOPAY"
    ) {
      return NextResponse.json(
        {
          error: "MangoPay payments are confirmed automatically via webhook",
          code: "MANGOPAY_WEBHOOK_CONFIRM",
        },
        { status: 403 }
      );
    }

    if (
      getPaymentProvider() === "manual_bit" ||
      booking.paymentMethod === "MANUAL_BIT"
    ) {
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
    logEvent({
      event: "payments.confirm.success",
      route: "/api/payments/confirm",
      context: { bookingId },
      tags: ["payments", "checkout"],
    });
    return NextResponse.json({ ok: true, bookingId: result.bookingId });
  } catch (error) {
    logApiError({
      event: "payments.confirm.failed",
      route: "/api/payments/confirm",
      error,
    });
    await forwardErrorIfConfigured({
      event: "payments.confirm.failed",
      route: "/api/payments/confirm",
      error,
    });
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
