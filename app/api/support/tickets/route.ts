import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { recordSystemAlert } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  let body: { title?: string; description?: string; pageUrl?: string; userAgent?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user?.id ?? null,
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : null,
      userAgent: typeof body.userAgent === "string" ? body.userAgent : null,
    },
    select: { id: true, status: true, createdAt: true },
  });

  await recordSystemAlert({
    level: "warning",
    source: "support.ticket",
    message: "New support ticket submitted",
    context: { ticketId: ticket.id, userId: user?.id ?? null },
  });

  return NextResponse.json({ ok: true, ticket });
}

