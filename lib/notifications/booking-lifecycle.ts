/**
 * Booking lifecycle email notifications. All helpers are best-effort: they catch
 * errors and log (bookingId, bookingRef, recipientRole) and never throw, so
 * route handlers and DB transitions are never blocked by email failures.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { getAppBaseUrl } from "@/lib/email/client";
import {
  renderBookingConfirmedEmail,
  getBookingConfirmedSubject,
  type BookingConfirmedPayload,
} from "@/lib/email/templates/booking-confirmed";
import {
  renderBookingRequestedEmail,
  getBookingRequestedSubject,
} from "@/lib/email/templates/booking-requested";
import {
  renderBookingActiveEmail,
  getBookingActiveSubject,
  type BookingActivePayload,
} from "@/lib/email/templates/booking-active";
import {
  renderBookingCompletedEmail,
  getBookingCompletedSubject,
  type BookingCompletedPayload,
} from "@/lib/email/templates/booking-completed";
import {
  renderDisputeOpenedEmail,
  getDisputeOpenedSubject,
  type DisputeOpenedPayload,
} from "@/lib/email/templates/dispute-opened";
import {
  renderDisputeResolvedEmail,
  getDisputeResolvedSubject,
  type DisputeResolvedPayload,
} from "@/lib/email/templates/dispute-resolved";

/**
 * Send "booking confirmed" emails to renter and owner after admin confirms payment.
 * Best-effort: logs errors and never throws. Does not block the confirmation flow.
 */
export async function sendBookingConfirmedEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendBookingConfirmedEmails: booking not found", { bookingId });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload: Omit<BookingConfirmedPayload, "recipientRole"> = {
      bookingRef,
      listingTitle: booking.listing.title,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      bookingUrl,
    };

    const subject = getBookingConfirmedSubject(bookingRef);

    if (booking.user?.email?.trim()) {
      const html = renderBookingConfirmedEmail({ ...payload, recipientRole: "renter" });
      const result = await sendEmail({ to: booking.user.email.trim(), subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-confirmed failed", {
          bookingId,
          bookingRef,
          recipientRole: "renter",
          error: result.error,
        });
      }
    } else {
      console.warn("[notifications] sendBookingConfirmedEmails: renter has no email", {
        bookingId,
        bookingRef,
      });
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (ownerEmail) {
      const html = renderBookingConfirmedEmail({ ...payload, recipientRole: "owner" });
      const result = await sendEmail({ to: ownerEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-confirmed failed", {
          bookingId,
          bookingRef,
          recipientRole: "owner",
          error: result.error,
        });
      }
    } else if (booking.listing.ownerId) {
      console.warn("[notifications] sendBookingConfirmedEmails: owner has no email", {
        bookingId,
        bookingRef,
      });
    }
  } catch (err) {
    console.error("[notifications] sendBookingConfirmedEmails error", { bookingId, err });
  }
}

/**
 * Send "booking requested" email to owner after a booking is successfully created.
 * Best-effort: logs errors and never throws. Does not block booking creation.
 */
export async function sendBookingRequestedEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendBookingRequestedEmails: booking not found", { bookingId });
      return;
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (!ownerEmail) {
      console.warn("[notifications] sendBookingRequestedEmails: owner has no email", {
        bookingId,
        bookingRef: booking.bookingRef ?? null,
      });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload = {
      bookingRef,
      listingTitle: booking.listing.title,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      renterName: booking.user?.name ?? "",
      bookingUrl,
    };

    const subject = getBookingRequestedSubject(bookingRef);
    const html = renderBookingRequestedEmail(payload);
    const result = await sendEmail({ to: ownerEmail, subject, html });

    if (!result.ok) {
      console.error("[notifications] booking-requested failed", {
        bookingId,
        bookingRef,
        recipientRole: "owner",
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[notifications] sendBookingRequestedEmails error", { bookingId, err });
  }
}

/**
 * Send "booking active" emails to renter and owner after pickup checklist completes (booking → ACTIVE).
 * Best-effort: logs errors and never throws. Does not block the transition.
 */
export async function sendBookingActiveEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendBookingActiveEmails: booking not found", { bookingId });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload: Omit<BookingActivePayload, "recipientRole"> = {
      bookingRef,
      listingTitle: booking.listing.title,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      bookingUrl,
    };

    const subject = getBookingActiveSubject(bookingRef);

    if (booking.user?.email?.trim()) {
      const html = renderBookingActiveEmail({ ...payload, recipientRole: "renter" });
      const result = await sendEmail({ to: booking.user.email.trim(), subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-active failed", {
          bookingId,
          bookingRef,
          recipientRole: "renter",
          error: result.error,
        });
      }
    } else {
      console.warn("[notifications] sendBookingActiveEmails: renter has no email", {
        bookingId,
        bookingRef,
      });
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (ownerEmail) {
      const html = renderBookingActiveEmail({ ...payload, recipientRole: "owner" });
      const result = await sendEmail({ to: ownerEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-active failed", {
          bookingId,
          bookingRef,
          recipientRole: "owner",
          error: result.error,
        });
      }
    } else if (booking.listing.ownerId) {
      console.warn("[notifications] sendBookingActiveEmails: owner has no email", {
        bookingId,
        bookingRef,
      });
    }
  } catch (err) {
    console.error("[notifications] sendBookingActiveEmails error", { bookingId, err });
  }
}

/**
 * Send "booking completed" emails to renter and owner after return checklist completes (booking → COMPLETED).
 * Best-effort: logs errors and never throws. Does not block the transition.
 */
export async function sendBookingCompletedEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendBookingCompletedEmails: booking not found", { bookingId });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload: Omit<BookingCompletedPayload, "recipientRole"> = {
      bookingRef,
      listingTitle: booking.listing.title,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      bookingUrl,
    };

    const subject = getBookingCompletedSubject(bookingRef);

    if (booking.user?.email?.trim()) {
      const html = renderBookingCompletedEmail({ ...payload, recipientRole: "renter" });
      const result = await sendEmail({ to: booking.user.email.trim(), subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-completed failed", {
          bookingId,
          bookingRef,
          recipientRole: "renter",
          error: result.error,
        });
      }
    } else {
      console.warn("[notifications] sendBookingCompletedEmails: renter has no email", {
        bookingId,
        bookingRef,
      });
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (ownerEmail) {
      const html = renderBookingCompletedEmail({ ...payload, recipientRole: "owner" });
      const result = await sendEmail({ to: ownerEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] booking-completed failed", {
          bookingId,
          bookingRef,
          recipientRole: "owner",
          error: result.error,
        });
      }
    } else if (booking.listing.ownerId) {
      console.warn("[notifications] sendBookingCompletedEmails: owner has no email", {
        bookingId,
        bookingRef,
      });
    }
  } catch (err) {
    console.error("[notifications] sendBookingCompletedEmails error", { bookingId, err });
  }
}

/**
 * Send "dispute opened" emails to renter, owner, and optionally admin (if ADMIN_EMAIL set).
 * Best-effort: logs errors and never throws. Does not block dispute creation.
 */
export async function sendDisputeOpenedEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendDisputeOpenedEmails: booking not found", { bookingId });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload: Omit<DisputeOpenedPayload, "recipientRole"> = {
      bookingRef,
      listingTitle: booking.listing.title,
      bookingUrl,
    };

    const subject = getDisputeOpenedSubject(bookingRef);

    if (booking.user?.email?.trim()) {
      const html = renderDisputeOpenedEmail({ ...payload, recipientRole: "renter" });
      const result = await sendEmail({ to: booking.user.email.trim(), subject, html });
      if (!result.ok) {
        console.error("[notifications] dispute-opened failed", {
          bookingId,
          bookingRef,
          recipientRole: "renter",
          error: result.error,
        });
      }
    } else {
      console.warn("[notifications] sendDisputeOpenedEmails: renter has no email", {
        bookingId,
        bookingRef,
      });
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (ownerEmail) {
      const html = renderDisputeOpenedEmail({ ...payload, recipientRole: "owner" });
      const result = await sendEmail({ to: ownerEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] dispute-opened failed", {
          bookingId,
          bookingRef,
          recipientRole: "owner",
          error: result.error,
        });
      }
    } else if (booking.listing.ownerId) {
      console.warn("[notifications] sendDisputeOpenedEmails: owner has no email", {
        bookingId,
        bookingRef,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    if (adminEmail) {
      const html = renderDisputeOpenedEmail({ ...payload, recipientRole: "admin" });
      const result = await sendEmail({ to: adminEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] dispute-opened failed", {
          bookingId,
          bookingRef,
          recipientRole: "admin",
          error: result.error,
        });
      }
    }
  } catch (err) {
    console.error("[notifications] sendDisputeOpenedEmails error", { bookingId, err });
  }
}

/**
 * Send "dispute resolved" emails to renter and owner after admin resolves dispute (booking → COMPLETED).
 * Best-effort: logs errors and never throws. Does not block the resolve flow.
 */
export async function sendDisputeResolvedEmails(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { email: true, name: true } },
        listing: {
          select: {
            title: true,
            ownerId: true,
            owner: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!booking) {
      console.warn("[notifications] sendDisputeResolvedEmails: booking not found", { bookingId });
      return;
    }

    const bookingRef = booking.bookingRef ?? bookingId.slice(0, 8);
    const baseUrl = getAppBaseUrl();
    const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

    const payload: Omit<DisputeResolvedPayload, "recipientRole"> = {
      bookingRef,
      listingTitle: booking.listing.title,
      bookingUrl,
    };

    const subject = getDisputeResolvedSubject(bookingRef);

    if (booking.user?.email?.trim()) {
      const html = renderDisputeResolvedEmail({ ...payload, recipientRole: "renter" });
      const result = await sendEmail({ to: booking.user.email.trim(), subject, html });
      if (!result.ok) {
        console.error("[notifications] dispute-resolved failed", {
          bookingId,
          bookingRef,
          recipientRole: "renter",
          error: result.error,
        });
      }
    } else {
      console.warn("[notifications] sendDisputeResolvedEmails: renter has no email", {
        bookingId,
        bookingRef,
      });
    }

    const ownerEmail = booking.listing.owner?.email?.trim();
    if (ownerEmail) {
      const html = renderDisputeResolvedEmail({ ...payload, recipientRole: "owner" });
      const result = await sendEmail({ to: ownerEmail, subject, html });
      if (!result.ok) {
        console.error("[notifications] dispute-resolved failed", {
          bookingId,
          bookingRef,
          recipientRole: "owner",
          error: result.error,
        });
      }
    } else if (booking.listing.ownerId) {
      console.warn("[notifications] sendDisputeResolvedEmails: owner has no email", {
        bookingId,
        bookingRef,
      });
    }
  } catch (err) {
    console.error("[notifications] sendDisputeResolvedEmails error", { bookingId, err });
  }
}
