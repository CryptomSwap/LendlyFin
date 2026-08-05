import { NextResponse } from "next/server";
import { createIntent } from "@/lib/payments/adapter";
import { requireBookingAccess } from "@/lib/booking-auth";
import { needsOnboarding } from "@/lib/auth/onboarding";
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

    const { error: authError, user } = await requireBookingAccess(bookingId);
    if (authError) return authError;
    if (user && needsOnboarding(user)) {
      return NextResponse.json(
        { error: "Complete your profile (name, phone, city) to pay", code: "ONBOARDING_REQUIRED" },
        { status: 403 }
      );
    }

    const result = await createIntent(bookingId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    logEvent({
      event: "payments.create_intent.success",
      route: "/api/payments/create-intent",
      actorId: user?.id ?? null,
      context: { bookingId, hasPaymentLink: !!result.paymentLink },
      tags: ["payments", "checkout"],
    });
    return NextResponse.json({
      intentId: result.intentId,
      ...(result.paymentLink && { paymentLink: result.paymentLink }),
      ...(result.checkoutUrl && { checkoutUrl: result.checkoutUrl }),
    });
  } catch (error) {
    logApiError({
      event: "payments.create_intent.failed",
      route: "/api/payments/create-intent",
      error,
    });
    await forwardErrorIfConfigured({
      event: "payments.create_intent.failed",
      route: "/api/payments/create-intent",
      error,
    });
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
