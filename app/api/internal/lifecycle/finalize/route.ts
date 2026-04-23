import { NextResponse } from "next/server";
import { finalizeElapsedReturnedBookings } from "@/lib/lifecycle/finalize-returned";
import { recordSystemAlert } from "@/lib/observability";

export const runtime = "nodejs";

/**
 * Internal lifecycle finalizer endpoint for scheduled invocation.
 * Requires header x-lifecycle-key matching LIFECYCLE_CRON_KEY.
 */
export async function POST(req: Request) {
  const expected = process.env.LIFECYCLE_CRON_KEY;
  const provided = req.headers.get("x-lifecycle-key");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await finalizeElapsedReturnedBookings();
  if (result.finalized > 0) {
    await recordSystemAlert({
      level: "info",
      source: "lifecycle.finalize",
      message: "Finalized returned bookings after dispute window.",
      context: result,
    });
  }

  return NextResponse.json({ ok: true, ...result });
}

