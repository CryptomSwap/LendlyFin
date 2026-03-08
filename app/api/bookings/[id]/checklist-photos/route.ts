import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireBookingAccess } from "@/lib/booking-auth";
import { CHECKLIST_PHOTO_TYPES } from "@/lib/booking-auth";

export const runtime = "nodejs";

const VALID_ANGLES = ["front", "side", "accessories"] as const;

/** POST: upload a checklist photo (type=pickup|return, angle=front|side|accessories). Replaces existing for that type+angle. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await ctx.params;
  const { error, booking } = await requireBookingAccess(bookingId);
  if (error) return error;
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const type = (formData.get("type") as string)?.trim().toLowerCase();
  const angle = (formData.get("angle") as string)?.trim().toLowerCase();
  const file = formData.get("file") as File | null;

  if (!CHECKLIST_PHOTO_TYPES.includes(type as "pickup" | "return")) {
    return NextResponse.json({ error: "type must be 'pickup' or 'return'" }, { status: 400 });
  }
  if (!VALID_ANGLES.includes(angle as "front" | "side" | "accessories")) {
    return NextResponse.json(
      { error: "angle must be one of: front, side, accessories" },
      { status: 400 }
    );
  }
  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Missing or invalid image file" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${angle}-${randomUUID()}.${ext}`;
  const uploadsDir = join(process.cwd(), "public", "uploads", "checklist", bookingId);
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  const filepath = join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  const url = `/uploads/checklist/${bookingId}/${filename}`;

  await prisma.bookingChecklistPhoto.upsert({
    where: {
      bookingId_type_angle: { bookingId, type, angle },
    },
    create: { bookingId, type, angle, url },
    update: { url },
  });

  return NextResponse.json({ url, angle });
}
