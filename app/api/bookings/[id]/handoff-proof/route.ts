import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";

export const runtime = "nodejs";

const VALID_TYPES = ["pickup", "return"] as const;
const VALID_SOURCES = ["user_device", "manual_override"] as const;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;

  const proofs = await prisma.bookingHandoffProof.findMany({
    where: { bookingId },
    orderBy: { capturedAt: "desc" },
  });
  return NextResponse.json({ proofs });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { type?: string; lat?: number; lng?: number; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(body.type ?? "").trim().toLowerCase();
  const source = String(body.source ?? "user_device").trim().toLowerCase();
  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "type must be pickup or return" }, { status: 400 });
  }
  if (!VALID_SOURCES.includes(source as (typeof VALID_SOURCES)[number])) {
    return NextResponse.json({ error: "source is invalid" }, { status: 400 });
  }

  const proof = await prisma.bookingHandoffProof.create({
    data: {
      bookingId,
      type,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      source,
      capturedAt: new Date(),
    },
  });

  return NextResponse.json({ proof }, { status: 201 });
}
