import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** GET: dispute detail with booking, pickup/return checklists, checklist photos. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          user: { select: { id: true, name: true } },
          listing: { select: { id: true, title: true, deposit: true, pricePerDay: true } },
          pickupChecklist: true,
          returnChecklist: true,
          checklistPhotos: { orderBy: [{ type: "asc" }, { angle: "asc" }] },
        },
      },
    },
  });

  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  return NextResponse.json(dispute);
}
