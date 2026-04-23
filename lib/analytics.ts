import { prisma } from "@/lib/prisma";

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
  await prisma.analyticsEvent.create({
    data: {
      eventName: input.eventName,
      bookingId: input.bookingId ?? null,
      userId: input.userId ?? null,
      payload: input.payload ? JSON.stringify(input.payload) : null,
    },
  });
}

