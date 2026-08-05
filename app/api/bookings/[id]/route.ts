import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;

  const { error: authError } = await requireBookingMessagesAccess(bookingId);
  if (authError) return authError;

  let booking: Awaited<ReturnType<typeof prisma.booking.findUnique>> | null = null;
  try {
    booking = await prisma.booking.findUnique({
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022" || error.code === "P2010") {
        return NextResponse.json({ error: "Booking data unavailable" }, { status: 404 });
      }
    }
    throw error;
  }
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(booking);
}
