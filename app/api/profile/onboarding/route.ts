import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: unknown; phoneNumber?: unknown; city?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!phoneNumber) missing.push("phoneNumber");
  if (!city) missing.push("city");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Missing or invalid required fields", fields: missing },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phoneNumber, city },
  });

  return NextResponse.json({ ok: true });
}
