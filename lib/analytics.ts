import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type TrackEventInput = {
  eventName:
    | "signup_completed"
    | "onboarding_completed"
    | "listing_created"
    | "kyc_submitted"
    | "admin_action_recorded"
    | "booking_started"
    | "booking_confirmed"
    | "pickup_checklist_submitted"
    | "return_checklist_submitted"
    | "dispute_opened"
    | "dispute_resolved"
    | "booking_completed";
  bookingId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
};

/**
 * Lightweight analytics event capture for pilot KPI export.
 * This intentionally stores raw event rows without external BI dependencies.
 */
export async function trackEvent(input: TrackEventInput) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName: input.eventName,
        bookingId: input.bookingId ?? null,
        userId: input.userId ?? null,
        payload: input.payload ? JSON.stringify(input.payload) : null,
      },
    });
  } catch (error) {
    // Analytics is non-critical; never block core product flows.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022" || error.code === "P2010") {
        console.warn("analyticsEvent table/query unavailable; skipping trackEvent");
        return;
      }
    }
    console.warn("trackEvent failed", error);
  }
}

