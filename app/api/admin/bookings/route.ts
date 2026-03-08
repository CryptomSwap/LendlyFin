import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET: list bookings for admin (recent first). */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
      pickupChecklist: { select: { id: true, completedAt: true } },
    },
  });

  return NextResponse.json({ bookings });
}
