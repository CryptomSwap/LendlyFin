import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { termsVersion?: string; privacyVersion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const termsVersion = String(body.termsVersion ?? "").trim();
  const privacyVersion = String(body.privacyVersion ?? "").trim();
  if (!termsVersion || !privacyVersion) {
    return NextResponse.json(
      { error: "termsVersion and privacyVersion are required" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      termsAcceptedVersion: termsVersion,
      privacyAcceptedVersion: privacyVersion,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

