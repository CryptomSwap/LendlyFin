import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * Admin-only endpoint to validate Sentry ingestion end-to-end.
 * Call GET /api/debug/sentry-test and verify event appears in Sentry.
 */
export async function GET() {
  const { error, user } = await requireAdmin();
  if (error) return error;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testError = new Error("Sentry test event from /api/debug/sentry-test");
  const eventId = Sentry.captureException(testError, {
    tags: { source: "manual_test", route: "/api/debug/sentry-test" },
    user: { id: user.id },
  });

  await Sentry.flush(2000);

  return NextResponse.json({
    ok: true,
    message: "Sentry test event sent",
    eventId,
  });
}
