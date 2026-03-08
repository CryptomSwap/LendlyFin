import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBookingMessagesAccess } from "@/lib/booking-auth";
import { needsOnboarding } from "@/lib/auth/onboarding";

export const runtime = "nodejs";

/** GET: conversation + messages for this booking. Renter, lender, or admin only. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user && needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to view messages", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  let conversation = booking.conversation ?? null;
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { bookingId },
    });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      bookingId: conversation.bookingId,
      createdAt: conversation.createdAt,
    },
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      senderId: m.senderId,
      senderName: m.sender.name,
    })),
    currentUserId: user?.id ?? null,
  });
}

/** POST: send a message. Renter, lender, or admin only. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking, user } = await requireBookingMessagesAccess(bookingId);
  if (error) return error;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (needsOnboarding(user)) {
    return NextResponse.json(
      { error: "Complete your profile (name, phone, city) to send messages", code: "ONBOARDING_REQUIRED" },
      { status: 403 }
    );
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }

  let conversation = booking.conversation ?? null;
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { bookingId },
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      body: text,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    senderId: message.senderId,
    senderName: message.sender.name,
  });
}
