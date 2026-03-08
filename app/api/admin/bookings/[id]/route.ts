import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET: admin view of a booking including pickup checklist and photos. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      listing: {
        select: {
          id: true,
          title: true,
          status: true,
          pricePerDay: true,
          deposit: true,
        },
      },
      pickupChecklist: true,
      returnChecklist: true,
      dispute: true,
      checklistPhotos: { orderBy: [{ type: "asc" }, { angle: "asc" }] },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
