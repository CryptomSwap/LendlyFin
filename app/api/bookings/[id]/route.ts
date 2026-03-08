import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;

  const { error: authError, booking: _ } = await requireBookingMessagesAccess(bookingId);
  if (authError) return authError;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" } },
        },
      },
      pickupChecklist: true,
      returnChecklist: true,
      checklistPhotos: true,
      dispute: true,
    },
  });
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(booking);
}
