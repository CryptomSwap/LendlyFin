import "server-only";
import MangoPay from "mangopay4-nodejs-sdk";
import { prisma } from "@/lib/prisma";
import { getBookingSummary } from "@/lib/pricing";
import { sendBookingConfirmedEmails } from "@/lib/notifications/booking-lifecycle";
import { trackEvent } from "@/lib/analytics";
import type { CreateIntentResult } from "./types";

let mpClient: MangoPay | null = null;

function getMangopayClient(): MangoPay {
  if (mpClient) return mpClient;

  const clientId = process.env.MANGOPAY_CLIENT_ID?.trim();
  const apiKey = process.env.MANGOPAY_API_KEY?.trim();
  if (!clientId || !apiKey) {
    throw new Error("MANGOPAY_CLIENT_ID and MANGOPAY_API_KEY must be configured");
  }

  const isProduction = process.env.MANGOPAY_API_URL?.includes("api.mangopay.com")
    && !process.env.MANGOPAY_API_URL?.includes("sandbox");

  mpClient = new MangoPay({
    clientId,
    clientApiKey: apiKey,
    baseUrl: isProduction
      ? "https://api.mangopay.com"
      : "https://api.sandbox.mangopay.com",
  });

  return mpClient;
}

function getAppBaseUrl(): string {
  const fromEnv = process.env.APP_BASE_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}

function getPlatformWalletId(): string {
  const walletId = process.env.MANGOPAY_PLATFORM_WALLET_ID?.trim();
  if (!walletId) {
    throw new Error("MANGOPAY_PLATFORM_WALLET_ID must be configured");
  }
  return walletId;
}

/** Whole ILS -> agorot (MangoPay uses smallest currency unit). */
function ilsToMinorUnits(wholeIls: number): number {
  return Math.round(wholeIls * 100);
}

/**
 * Ensure a MangoPay Natural User exists for the given app user.
 * Creates one lazily on first payment and stores the ID.
 */
async function ensureMangopayUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, mangopayUserId: true, name: true, email: true },
  });

  if (!user) throw new Error("User not found");

  if (user.mangopayUserId) return user.mangopayUserId;

  const mp = getMangopayClient();
  const nameParts = (user.name || "Lendly User").split(" ");
  const firstName = nameParts[0] || "Lendly";
  const lastName = nameParts.slice(1).join(" ") || "User";

  const mpUser = await mp.Users.create({
    PersonType: "NATURAL",
    FirstName: firstName,
    LastName: lastName,
    Email: user.email || `user-${userId}@lendly.co.il`,
    UserCategory: "PAYER",
    TermsAndConditionsAccepted: true,
  } as MangoPay.user.CreateUserNaturalPayerData);

  await prisma.user.update({
    where: { id: userId },
    data: { mangopayUserId: mpUser.Id },
  });

  return mpUser.Id;
}

async function getBookingForCheckout(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { title: true, pricePerDay: true, deposit: true } },
      user: { select: { id: true, email: true, name: true, mangopayUserId: true } },
    },
  });
}

/**
 * Create a MangoPay Card Web PayIn for the booking total.
 * Uses the Web execution type which gives us a RedirectURL for the
 * hosted payment page -- similar to Stripe Checkout's redirect flow.
 */
export async function createMangopayPayIn(
  bookingId: string
): Promise<CreateIntentResult> {
  const booking = await getBookingForCheckout(bookingId);
  if (!booking) return { error: "Booking not found" };

  const summary = getBookingSummary({
    pricePerDay: booking.listing.pricePerDay,
    deposit: booking.listing.deposit,
    startDate: booking.startDate,
    endDate: booking.endDate,
  });

  const totalMinor = ilsToMinorUnits(summary.totalDue);
  if (totalMinor < 100) {
    return { error: "Payment amount below minimum (1 ILS)" };
  }

  const mpUserId = await ensureMangopayUser(booking.user.id);
  const mp = getMangopayClient();
  const walletId = getPlatformWalletId();
  const base = getAppBaseUrl();
  const ref = booking.bookingRef ?? bookingId.slice(0, 8);

  const payIn = await mp.PayIns.create({
    ExecutionType: "WEB",
    PaymentType: "CARD",
    AuthorId: mpUserId,
    CreditedWalletId: walletId,
    DebitedFunds: {
      Currency: "ILS",
      Amount: totalMinor,
    },
    Fees: {
      Currency: "ILS",
      Amount: ilsToMinorUnits(summary.serviceFee),
    },
    ReturnURL: `${base}/checkout?bookingId=${encodeURIComponent(bookingId)}&paid=1`,
    CardType: "CB_VISA_MASTERCARD",
    Culture: "EN" as MangoPay.CountryISO,
    SecureMode: "FORCE",
    StatementDescriptor: `LENDLY ${ref}`.slice(0, 10),
    Tag: JSON.stringify({ bookingId, bookingRef: ref }),
  } as MangoPay.payIn.CreateCardWebPayIn);

  if (!payIn.RedirectURL) {
    return { error: "MangoPay did not return a redirect URL" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      rentalSubtotal: summary.rentalSubtotal,
      serviceFee: summary.serviceFee,
      depositAmount: summary.depositAmount,
      totalDue: summary.totalDue,
      paymentIntentId: payIn.Id,
      paymentStatus: "PENDING",
      paymentMethod: "MANGOPAY",
      paymentLink: payIn.RedirectURL,
    },
  });

  return {
    intentId: payIn.Id,
    checkoutUrl: payIn.RedirectURL,
  };
}

/**
 * Mark booking paid after a successful MangoPay PayIn (idempotent).
 * Called from the webhook handler.
 */
export async function fulfillBookingFromPayIn(
  payInId: string
): Promise<{ ok: true; bookingId: string } | { error: string }> {
  const mp = getMangopayClient();
  const payIn = await mp.PayIns.get(payInId);

  if (!payIn) {
    return { error: "PayIn not found in MangoPay" };
  }

  let bookingId: string | null = null;
  try {
    const tag = JSON.parse(payIn.Tag || "{}");
    bookingId = tag.bookingId ?? null;
  } catch {
    // Tag parsing failed
  }

  if (!bookingId) {
    return { error: "Missing bookingId in PayIn tag" };
  }

  if (payIn.Status !== "SUCCEEDED") {
    return { error: `PayIn not succeeded: ${payIn.Status} (${payIn.ResultMessage})` };
  }

  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, paymentStatus: true, status: true },
  });
  if (!existing) {
    return { error: "Booking not found" };
  }

  if (existing.paymentStatus === "SUCCEEDED" && existing.status === "CONFIRMED") {
    return { ok: true, bookingId };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "SUCCEEDED",
      depositStatus: "HELD",
      status: "CONFIRMED",
      paymentMethod: "MANGOPAY",
      paymentIntentId: payIn.Id,
      paymentConfirmedAt: new Date(),
      paymentLink: null,
    },
  });

  await sendBookingConfirmedEmails(bookingId);
  await trackEvent({
    eventName: "booking_confirmed",
    bookingId,
    payload: { source: "mangopay_webhook" },
  });

  return { ok: true, bookingId };
}

/**
 * Handle the return URL redirect: check the PayIn status by looking up
 * the booking's paymentIntentId (which is the MangoPay PayIn ID).
 */
export async function checkPayInStatus(
  bookingId: string
): Promise<{ status: string; resultCode?: string } | { error: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { paymentIntentId: true, paymentStatus: true },
  });

  if (!booking?.paymentIntentId) {
    return { error: "No payment found for this booking" };
  }

  if (booking.paymentStatus === "SUCCEEDED") {
    return { status: "SUCCEEDED" };
  }

  const mp = getMangopayClient();
  const payIn = await mp.PayIns.get(booking.paymentIntentId);

  return {
    status: payIn.Status,
    resultCode: payIn.ResultCode,
  };
}
