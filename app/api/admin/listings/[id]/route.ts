import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

type Action = "approve" | "reject" | "pause" | "activate";

const VALID_ACTIONS: Action[] = ["approve", "reject", "pause", "activate"];

/** Allowed transitions: any -> ACTIVE (approve/activate), any -> REJECTED (reject), any -> PAUSED (pause) */
function nextStatus(action: Action, currentStatus: string): string | null {
  switch (action) {
    case "approve":
    case "activate":
      return "ACTIVE";
    case "reject":
      return "REJECTED";
    case "pause":
      return "PAUSED";
    default:
      return null;
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  let body: { action?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = (body.action ?? "").toLowerCase() as Action;
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: "action must be one of: approve, reject, pause, activate" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } } },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const newStatus = nextStatus(action, listing.status);
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const reason = typeof body.reason === "string" ? body.reason.trim() : null;

  await prisma.$transaction([
    prisma.listing.update({
      where: { id },
      data: {
        status: newStatus as "ACTIVE" | "REJECTED" | "PAUSED",
        ...(newStatus === "REJECTED" && reason
          ? { statusRejectionReason: reason }
          : newStatus !== "REJECTED"
            ? { statusRejectionReason: null }
            : {}),
      },
    }),
    prisma.auditLog.create({
      data: {
        entityType: "LISTING",
        entityId: id,
        action,
        adminUserId: adminUser.id,
        adminName: adminUser.name,
        reason: reason ?? undefined,
      },
    }),
  ]);

  const updated = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      owner: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(updated);
}
