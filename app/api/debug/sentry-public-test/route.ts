import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

/**
 * Public test endpoint for validating Sentry ingestion.
 * Enabled in development, or in production only when explicitly toggled.
 */
export async function GET() {
  const enabledInProd = process.env.SENTRY_PUBLIC_TEST_ENDPOINT === "true";
  if (process.env.NODE_ENV === "production" && !enabledInProd) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eventId = Sentry.captureMessage("Sentry public test event", "error");
  await Sentry.flush(2000);

  return NextResponse.json({
    ok: true,
    message: "Sentry public test event sent",
    eventId,
  });
}
