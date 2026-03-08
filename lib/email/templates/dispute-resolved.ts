import "server-only";

export type DisputeResolvedPayload = {
  bookingRef: string;
  listingTitle: string;
  bookingUrl: string;
  /** "renter" | "owner" for recipient-specific copy */
  recipientRole: "renter" | "owner";
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Hebrew RTL dispute-resolved email HTML.
 */
export function renderDisputeResolvedEmail(payload: DisputeResolvedPayload): string {
  const { bookingRef, listingTitle, bookingUrl } = payload;

  const intro = "המחלוקת בהזמנה נפתרה. ההזמנה נסגרה.";

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;font-family:system-ui,sans-serif;background:#f5f5f5;direction:rtl;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <p style="margin:0 0 16px;font-size:16px;color:#111;">${intro}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#333;"><strong>מספר הזמנה:</strong> <span dir="ltr">${escapeHtml(bookingRef)}</span></p>
      <p style="margin:0 0 20px;font-size:14px;color:#333;"><strong>מודעה:</strong> ${escapeHtml(listingTitle)}</p>
      <p style="margin:0;">
        <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background:#22c55e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">צפה בהזמנה</a>
      </p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#666;">Lendly – השכרה חכמה</p>
  </div>
</body>
</html>
`.trim();
}

export function getDisputeResolvedSubject(bookingRef: string): string {
  return `המחלוקת נפתרה – ${bookingRef}`;
}
