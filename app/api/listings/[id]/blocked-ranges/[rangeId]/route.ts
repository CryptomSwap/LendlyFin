import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

/** Delete a blocked range. Owner/admin only. */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; rangeId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId, rangeId } = await ctx.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  const isAdmin = !!user.isAdmin;
  if (!(isAdmin || (listing.ownerId && listing.ownerId === user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const range = await prisma.listingBlockedRange.findFirst({
    where: { id: rangeId, listingId },
  });
  if (!range) {
    return NextResponse.json({ error: "Blocked range not found" }, { status: 404 });
  }

  await prisma.listingBlockedRange.delete({
    where: { id: rangeId },
  });

  return NextResponse.json({ success: true });
}
