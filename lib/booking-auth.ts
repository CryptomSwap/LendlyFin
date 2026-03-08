import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin";
import { isAdminUser } from "@/lib/admin";

/**
 * Ensures the current user can access the booking (renter or admin).
 * Returns { booking, user } or { error }.
 */
export async function requireBookingAccess(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), booking: null, user: null };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: true,
      pickupChecklist: true,
      returnChecklist: true,
      checklistPhotos: true,
    },
  });

  if (!booking) {
    return { error: NextResponse.json({ error: "Booking not found" }, { status: 404 }), booking: null, user: null };
  }

  const isRenter = booking.userId === user.id;
  const isAdmin = await isAdminUser(user.id);

  if (!isRenter && !isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), booking: null, user: null };
  }

  return { error: null, booking, user };
}

/**
 * Ensures the current user can access the booking's messages (renter, lender/owner, or admin).
 * Returns { booking, user } or { error }. Use for GET/POST /api/bookings/[id]/messages.
 */
export async function requireBookingMessagesAccess(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), booking: null, user: null };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { id: true, ownerId: true, title: true } },
      conversation: true,
    },
  });

  if (!booking) {
    return { error: NextResponse.json({ error: "Booking not found" }, { status: 404 }), booking: null, user: null };
  }

  const isRenter = booking.userId === user.id;
  const isLender = booking.listing?.ownerId != null && booking.listing.ownerId === user.id;
  const isAdmin = await isAdminUser(user.id);

  if (!isRenter && !isLender && !isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), booking: null, user: null };
  }

  return { error: null, booking, user };
}

export const PICKUP_PHOTO_ANGLES = ["front", "side", "accessories"] as const;
export type PickupPhotoAngle = (typeof PICKUP_PHOTO_ANGLES)[number];

/** Same required angles for return checklist photos */
export const RETURN_PHOTO_ANGLES = ["front", "side", "accessories"] as const;
export type ReturnPhotoAngle = (typeof RETURN_PHOTO_ANGLES)[number];

export const CHECKLIST_PHOTO_TYPES = ["pickup", "return"] as const;
export type ChecklistPhotoType = (typeof CHECKLIST_PHOTO_TYPES)[number];
