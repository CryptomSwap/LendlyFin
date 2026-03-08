/**
 * Human-readable booking reference for manual Bit reconciliation and support.
 * Format: LND-XXXXXX (e.g. LND-A1B2C3) — stable, short, unique.
 * Generated once at booking creation.
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const PREFIX = "LND-";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 5;

/** Generate a single ref code: 6 uppercase hex chars (0-9A-F). */
function generateCode(): string {
  const bytes = randomBytes(Math.ceil(CODE_LENGTH / 2));
  return bytes.toString("hex").toUpperCase().slice(0, CODE_LENGTH);
}

/**
 * Generate a unique booking reference. Retries on collision (rare).
 * Call inside a transaction or before create; then set on the new booking.
 */
export async function generateUniqueBookingRef(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const ref = PREFIX + generateCode();
    const existing = await prisma.booking.findUnique({
      where: { bookingRef: ref },
      select: { id: true },
    });
    if (!existing) return ref;
  }
  throw new Error("Failed to generate unique booking reference");
}
