// DEV-ONLY: stores KYC images locally under
// public/uploads/kyc/{userId}/{type}.{ext}
// In production replace this with proper object storage (S3, Cloudinary, etc.).
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getCurrentUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "selfie" or "id"

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file or type parameter" },
        { status: 400 }
      );
    }

    if (type !== "selfie" && type !== "id") {
      return NextResponse.json(
        { error: "Type must be 'selfie' or 'id'" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory structure
    const uploadsDir = join(process.cwd(), "public", "uploads", "kyc", user.id);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate filename with extension
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${type}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the URL path (relative to public directory)
    const url = `/uploads/kyc/${user.id}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
