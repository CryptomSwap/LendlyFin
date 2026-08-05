import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminUser } from "@/lib/admin";

async function findBookingWithFallback(bookingId: string, includeConversation = false) {
  try {
    return await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        pickupChecklist: true,
        returnChecklist: true,
        checklistPhotos: true,
        ...(includeConversation ? { conversation: true } : {}),
      },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      (error.code !== "P2022" && error.code !== "P2010" && error.code !== "P2021")
    ) {
      throw error;
    }

    const base = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        listingId: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        paymentMethod: true,
      },
    });
    if (!base) return null;

    const [listing, pickupChecklist, returnChecklist, checklistPhotos, conversation] =
      await Promise.all([
        prisma.listing.findUnique({ where: { id: base.listingId }, select: { id: true, ownerId: true, title: true } }),
        prisma.pickupChecklist.findUnique({ where: { bookingId } }).catch(() => null),
        prisma.returnChecklist.findUnique({ where: { bookingId } }).catch(() => null),
        prisma.bookingChecklistPhoto.findMany({ where: { bookingId } }).catch(() => []),
        includeConversation
          ? prisma.conversation.findUnique({ where: { bookingId } }).catch(() => null)
          : Promise.resolve(null),
      ]);

    return {
      ...base,
      disputeWindowEndsAt: null,
      listing,
      pickupChecklist,
      returnChecklist,
      checklistPhotos,
      ...(includeConversation ? { conversation } : {}),
    };
  }
}

/**
 * Ensures the current user can access the booking (renter or admin).
 * Returns { booking, user } or { error }.
 */
export async function requireBookingAccess(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), booking: null, user: null };
  }

  const booking = await findBookingWithFallback(bookingId);

  if (!booking) {
    return { error: NextResponse.json({ error: "Booking not found" }, { status: 404 }), booking: null, user: null };
  }

  const isRenter = booking.userId === user.id;
  const isAdmin = !!user.isAdmin;

  if (!isRenter && !isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), booking: null, user: null };
  }

  return { error: null, booking, user };
}

/**
 * Ensures the current user can access booking actions as participant:
 * renter, listing owner (lender), or admin.
 */
export async function requireBookingParticipantAccess(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), booking: null, user: null };
  }

  const booking = await findBookingWithFallback(bookingId);

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

/**
 * Ensures the current user can access the booking's messages (renter, lender/owner, or admin).
 * Returns { booking, user } or { error }. Use for GET/POST /api/bookings/[id]/messages.
 */
export async function requireBookingMessagesAccess(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), booking: null, user: null };
  }

  const booking = await findBookingWithFallback(bookingId, true);

  if (!booking) {
    return { error: NextResponse.json({ error: "Booking not found" }, { status: 404 }), booking: null, user: null };
  }

  const isRenter = booking.userId === user.id;
  const isLender = booking.listing?.ownerId != null && booking.listing.ownerId === user.id;
  const isAdmin = !!user.isAdmin;

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
