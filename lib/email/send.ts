import "server-only";
import { getResendClient, getEmailFrom } from "./client";

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

/**
 * Send a single transactional email via Resend.
 * Best-effort: logs errors and returns { ok: false } without throwing.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getResendClient();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set; skipping send");
    return { ok: false, error: "Email not configured" };
  }

  const to = Array.isArray(params.to) ? params.to : [params.to];
  const from = params.from ?? getEmailFrom();

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: typeof error === "object" ? JSON.stringify(error) : String(error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", message);
    return { ok: false, error: message };
  }
}
