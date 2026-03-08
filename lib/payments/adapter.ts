/**
 * Payment adapter: mock implementation for alpha.
 * Replace with Stripe adapter when integrating real payments.
 * All amounts in whole ILS; use lib/pricing for consistency.
 */

import { prisma } from "@/lib/prisma";
import { getBookingSummary } from "@/lib/pricing";
import type {
  CreateIntentResult,
  ConfirmPaymentResult,
  DepositReleaseResult,
  PaymentSnapshot,
} from "./types";

export type { CreateIntentResult, ConfirmPaymentResult, DepositReleaseResult, PaymentSnapshot } from "./types";

async function updateDepositAndOptionalStatus(
  bookingId: string,
  depositStatus: "RELEASED_RENTER" | "RELEASED_OWNER" | "SPLIT",
  setBookingCompleted: boolean
) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      depositStatus,
      ...(setBookingCompleted ? { status: "COMPLETED" as const } : {}),
    },
  });
}

const MANUAL_BIT_PAYMENT_URL = process.env.MANUAL_BIT_PAYMENT_URL ?? "";

/**
 * Create a payment intent for a booking.
 * Pilot: manual Bit — snapshots amounts, sets paymentMethod MANUAL_BIT and paymentLink from env, returns link for redirect.
 * Updates booking with rentalSubtotal, serviceFee, depositAmount, totalDue, paymentStatus PENDING.
 */
export async function createIntent(bookingId: string): Promise<CreateIntentResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });

  if (!booking) return { error: "Booking not found" };

  const summary = getBookingSummary({
    pricePerDay: booking.listing.pricePerDay,
    deposit: booking.listing.deposit,
    startDate: booking.startDate,
    endDate: booking.endDate,
  });

  const mockIntentId = `pi_mock_${Math.random().toString(36).slice(2, 10)}`;
  const useManualBit = MANUAL_BIT_PAYMENT_URL.length > 0;

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      rentalSubtotal: summary.rentalSubtotal,
      serviceFee: summary.serviceFee,
      depositAmount: summary.depositAmount,
      totalDue: summary.totalDue,
      paymentIntentId: mockIntentId,
      paymentStatus: "PENDING",
      ...(useManualBit
        ? {
            paymentMethod: "MANUAL_BIT",
            paymentLink: MANUAL_BIT_PAYMENT_URL,
          }
        : {}),
    },
  });

  if (useManualBit) {
    return { intentId: mockIntentId, paymentLink: MANUAL_BIT_PAYMENT_URL };
  }
  return { intentId: mockIntentId };
}

/**
 * Prepare booking for manual Bit payment: snapshot amounts and set payment link.
 * Idempotent; use when checkout needs the link without going through createIntent (e.g. summary already loaded).
 */
export async function startManualBitPayment(bookingId: string): Promise<{ paymentLink: string } | { error: string }> {
  const url = process.env.MANUAL_BIT_PAYMENT_URL;
  if (!url?.trim()) return { error: "MANUAL_BIT_PAYMENT_URL not configured" };

  const result = await createIntent(bookingId);
  if ("error" in result) return result;
  if (result.paymentLink) return { paymentLink: result.paymentLink };
  return { error: "Payment link not available" };
}

/**
 * Admin confirms manual payment (e.g. after verifying Bit). Sets paymentStatus SUCCEEDED, depositStatus HELD, status CONFIRMED.
 */
export async function confirmManualPayment(
  bookingId: string,
  opts: { adminUserId: string; adminName: string; notes?: string | null }
): Promise<ConfirmPaymentResult> {
  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!existing) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      status: "CONFIRMED",
      paymentConfirmedAt: new Date(),
      paymentConfirmedByAdminId: opts.adminUserId,
      paymentNotes: opts.notes ?? undefined,
    },
  });

  return { ok: true, bookingId };
}

/**
 * Confirm payment for a booking (mock: marks paid and sets deposit held).
 * Sets paymentStatus SUCCEEDED, depositStatus HELD, status CONFIRMED.
 */
export async function confirmPayment(bookingId: string): Promise<ConfirmPaymentResult> {
  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!existing) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      status: "CONFIRMED",
    },
  });

  return { ok: true, bookingId };
}

/**
 * Release deposit to renter (e.g. successful return, no damage).
 * Optionally set booking status to COMPLETED (return-checklist flow).
 */
export async function releaseDepositToRenter(
  bookingId: string,
  opts?: { setBookingCompleted?: boolean }
): Promise<DepositReleaseResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found" };

  await updateDepositAndOptionalStatus(
    bookingId,
    "RELEASED_RENTER",
    opts?.setBookingCompleted ?? false
  );
  return { ok: true, depositStatus: "RELEASED_RENTER" };
}

/**
 * Release deposit to owner (e.g. dispute resolved in owner's favor).
 * Optionally set booking status to COMPLETED (dispute resolve flow).
 */
export async function releaseDepositToOwner(
  bookingId: string,
  opts?: { setBookingCompleted?: boolean }
): Promise<DepositReleaseResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found" };

  await updateDepositAndOptionalStatus(
    bookingId,
    "RELEASED_OWNER",
    opts?.setBookingCompleted ?? false
  );
  return { ok: true, depositStatus: "RELEASED_OWNER" };
}

/**
 * Split deposit (e.g. dispute resolved with split).
 * Optionally set booking status to COMPLETED (dispute resolve flow).
 */
export async function splitDeposit(
  bookingId: string,
  opts?: { setBookingCompleted?: boolean }
): Promise<DepositReleaseResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true },
  });
  if (!booking) return { error: "Booking not found" };

  await updateDepositAndOptionalStatus(
    bookingId,
    "SPLIT",
    opts?.setBookingCompleted ?? false
  );
  return { ok: true, depositStatus: "SPLIT" };
}

/**
 * Get payment/deposit snapshot for a booking (checkout summary, admin, etc.).
 * Uses stored amounts when present, otherwise computes from listing + dates.
 */
export async function getPaymentSnapshot(bookingId: string): Promise<PaymentSnapshot | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });
  if (!booking) return null;

  const hasAmounts =
    booking.rentalSubtotal != null &&
    booking.rentalSubtotal > 0 &&
    booking.totalDue != null &&
    booking.totalDue > 0;
  const summary = hasAmounts
    ? {
        rentalSubtotal: booking.rentalSubtotal!,
        serviceFee: booking.serviceFee ?? 0,
        depositAmount: booking.depositAmount ?? 0,
        totalDue: booking.totalDue!,
        lenderPayout: (booking.rentalSubtotal ?? 0) - (booking.serviceFee ?? 0),
      }
    : getBookingSummary({
        pricePerDay: booking.listing.pricePerDay,
        deposit: booking.listing.deposit,
        startDate: booking.startDate,
        endDate: booking.endDate,
      });

  const paymentLink =
    booking.paymentLink ?? (process.env.MANUAL_BIT_PAYMENT_URL || null);

  return {
    bookingId: booking.id,
    bookingRef: booking.bookingRef ?? null,
    title: booking.listing.title,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    rentalSubtotal: summary.rentalSubtotal,
    serviceFee: summary.serviceFee,
    depositAmount: summary.depositAmount,
    totalDue: summary.totalDue,
    lenderPayout: summary.lenderPayout,
    paymentStatus: String(booking.paymentStatus ?? "PENDING"),
    depositStatus: String(booking.depositStatus ?? "PENDING"),
    paymentMethod: booking.paymentMethod ?? null,
    paymentLink: paymentLink || null,
  };
}
