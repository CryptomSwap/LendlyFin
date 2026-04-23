import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";

/**
 * Deterministically finalize RETURNED bookings whose dispute window elapsed and have no dispute.
 * Idempotent by status guard (only updates RETURNED).
 */
export async function finalizeElapsedReturnedBookings(opts?: { limit?: number }) {
  const now = new Date();
  const candidates = await prisma.booking.findMany({
    where: {
      status: "RETURNED",
      disputeWindowEndsAt: { lte: now },
      dispute: { is: null },
    },
    take: opts?.limit ?? 200,
    select: { id: true, userId: true },
  });

  let finalized = 0;
  for (const b of candidates) {
    const updated = await prisma.booking.updateMany({
      where: { id: b.id, status: "RETURNED" },
      data: { status: "COMPLETED" },
    });
    if (updated.count > 0) {
      finalized += 1;
      await trackEvent({
        eventName: "booking_completed",
        bookingId: b.id,
        userId: b.userId,
        payload: { source: "finalizer_job" },
      });
    }
  }

  return { scanned: candidates.length, finalized };
}

