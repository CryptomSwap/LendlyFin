import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Server-only Resend client. Returns null if RESEND_API_KEY is not set (email sending disabled).
 */
export function getResendClient(): Resend | null {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey);
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM;
  if (from && typeof from === "string" && from.trim() !== "") {
    return from.trim();
  }
  return "notifications@lendly.co.il";
}

/**
 * Base URL for links in emails (e.g. booking page).
 * In development, defaults to localhost so links do not point at production when APP_BASE_URL is unset.
 */
export function getAppBaseUrl(): string {
  const url = process.env.APP_BASE_URL;
  if (url && typeof url === "string" && url.trim() !== "") {
    return url.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return "https://lendly.co.il";
}
