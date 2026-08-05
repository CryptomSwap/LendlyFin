import { NextResponse } from "next/server";
import { fulfillBookingFromPayIn } from "@/lib/payments/mangopay";
import { logApiError, logEvent } from "@/lib/observability";

export const runtime = "nodejs";

/**
 * MangoPay webhook handler.
 * MangoPay sends GET requests with ?EventType=...&RessourceId=...&Date=...
 * We must return 200 quickly; MangoPay retries on non-2xx.
 *
 * Unlike Stripe, MangoPay webhooks don't have a signature to verify.
 * Security: the webhook URL should be kept secret and registered in MangoPay Dashboard.
 * We verify the event by fetching the PayIn from the API (source of truth).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const eventType = url.searchParams.get("EventType");
  const resourceId = url.searchParams.get("RessourceId");

  if (!eventType || !resourceId) {
    return NextResponse.json({ error: "Missing EventType or RessourceId" }, { status: 400 });
  }

  try {
    if (eventType === "PAYIN_NORMAL_SUCCEEDED") {
      const result = await fulfillBookingFromPayIn(resourceId);
      if ("error" in result) {
        logApiError({
          event: "mangopay.webhook.fulfill_failed",
          route: "/api/webhooks/mangopay",
          error: new Error(result.error),
          context: { resourceId, eventType },
        });
        return NextResponse.json({ error: result.error }, { status: 200 });
      }
      logEvent({
        event: "mangopay.webhook.payin_succeeded",
        route: "/api/webhooks/mangopay",
        context: { bookingId: result.bookingId, payInId: resourceId },
        tags: ["payments", "mangopay"],
      });
    } else if (eventType === "PAYIN_NORMAL_FAILED") {
      logEvent({
        event: "mangopay.webhook.payin_failed",
        route: "/api/webhooks/mangopay",
        context: { resourceId, eventType },
        tags: ["payments", "mangopay"],
      });
    }
  } catch (error) {
    logApiError({
      event: "mangopay.webhook.handler_failed",
      route: "/api/webhooks/mangopay",
      error,
      context: { eventType, resourceId },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  return GET(new Request(url.toString(), { method: "GET", headers: req.headers }));
}
