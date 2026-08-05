export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { formatMoneyIls } from "@/lib/pricing";
import { getBookingStatusLabel, getPaymentStatusLabel, getDepositStatusLabel } from "@/lib/status-labels";
import { AdminConfirmPaymentForm } from "./confirm-payment-form";
import { AdminBookingOpsForm } from "./admin-booking-ops-form";
import { PageContainer } from "@/components/layout";

async function getBooking(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/admin/bookings/${id}`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return null;
  return res.json();
}

async function ensureAdmin() {
  const h = await headers();
  const host = h.get("host");
  const cookie = h.get("cookie");
  if (!host) return false;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return false;
  const data = await res.json();
  const me = data.user || data;
  return !!me?.isAdmin;
}

async function getReviews(bookingId: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return [];
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/bookings/${bookingId}/reviews`, {
    cache: "no-store",
    headers: { cookie: h.get("cookie") ?? "" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews ?? [];
}

const ANGLE_LABELS: Record<string, string> = {
  front: "מבט קדמי",
  side: "מבט צד",
  accessories: "אביזרים",
};

export default async function AdminBookingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const isAdmin = await ensureAdmin();
  if (!isAdmin) redirect("/");

  const { id } = await props.params;
  const [booking, reviews] = await Promise.all([getBooking(id), getReviews(id)]);

  if (!booking) {
    return (
      <div className="p-4">
        <p>הזמנה לא נמצאה</p>
        <Link href="/admin/bookings" className="text-[#1A8C6A] underline mt-2 inline-block">חזרה</Link>
      </div>
    );
  }

  const pickupChecklist = booking.pickupChecklist;
  const returnChecklist = booking.returnChecklist;
  const dispute = booking.dispute;
  const allPhotos = booking.checklistPhotos ?? [];
  const pickupPhotos = allPhotos.filter((p: { type: string }) => p.type === "pickup");
  const returnPhotos = allPhotos.filter((p: { type: string }) => p.type === "return");

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="wide" className="space-y-4">
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1 font-assistant text-[13px] text-[#888888] hover:text-black"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה
        </Link>
      </div>

      <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">הזמנה – צפייה מנהל</h1>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פרטי הזמנה</h2>
        </div>
        <div className="space-y-1 font-assistant text-[13px] text-black">
          {booking.bookingRef && (
            <p><span className="font-sans font-bold">מספר הזמנה:</span> <span className="font-mono" dir="ltr">{booking.bookingRef}</span></p>
          )}
          <p><span className="font-sans font-bold">סטטוס:</span> {getBookingStatusLabel(booking.status)}</p>
          <p><span className="font-sans font-bold">מודעה:</span> {booking.listing?.title}</p>
          <p><span className="font-sans font-bold">שוכר:</span> {booking.user?.name}</p>
          <p>
            <span className="font-sans font-bold">תאריכים:</span>{" "}
            {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}
          </p>
          <p><span className="font-sans font-bold">פיקדון:</span> {booking.listing ? formatMoneyIls(booking.listing.deposit) : "—"}</p>
          {booking.returnedAt && (
            <p>
              <span className="font-sans font-bold">מועד החזרה:</span>{" "}
              {new Date(booking.returnedAt).toLocaleString("he-IL")}
            </p>
          )}
          {booking.disputeWindowEndsAt && (
            <p>
              <span className="font-sans font-bold">סיום חלון מחלוקת:</span>{" "}
              {new Date(booking.disputeWindowEndsAt).toLocaleString("he-IL")}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">פעולות תפעול פיילוט</h2>
        </div>
        <div>
          <AdminBookingOpsForm bookingId={booking.id} currentStatus={booking.status} />
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">תשלום ופיקדון</h2>
        </div>
        <div className="space-y-1 font-assistant text-[13px] text-black">
          {booking.bookingRef && (
            <p><span className="font-sans font-bold">מספר הזמנה:</span> <span className="font-mono" dir="ltr">{booking.bookingRef}</span></p>
          )}
          <p><span className="font-sans font-bold">השכרה:</span> {formatMoneyIls(booking.rentalSubtotal ?? 0)}</p>
          <p><span className="font-sans font-bold">עמלת פלטפורמה:</span> {formatMoneyIls(booking.serviceFee ?? 0)}</p>
          <p><span className="font-sans font-bold">פיקדון (סכום):</span> {formatMoneyIls(booking.depositAmount ?? 0)}</p>
          <p><span className="font-sans font-bold">סה״כ לתשלום:</span> {formatMoneyIls(booking.totalDue ?? 0)}</p>
          <p><span className="font-sans font-bold">סטטוס תשלום:</span> {getPaymentStatusLabel(booking.paymentStatus)}</p>
          <p><span className="font-sans font-bold">סטטוס פיקדון:</span> {getDepositStatusLabel(booking.depositStatus)}</p>
          {booking.paymentMethod && (
            <p><span className="font-sans font-bold">אמצעי תשלום:</span>{" "}
              {booking.paymentMethod === "MANUAL_BIT"
                ? "Bit (ידני)"
                : booking.paymentMethod === "MANGOPAY"
                  ? "MangoPay"
                  : booking.paymentMethod}
            </p>
          )}
          {booking.paymentLink && (
            <p className="text-[#888888] text-xs mt-1">קישור תשלום: <a href={booking.paymentLink} target="_blank" rel="noopener noreferrer" className="underline">תשלום</a></p>
          )}
          {booking.paymentConfirmedAt && (
            <p className="text-[#888888] text-xs mt-1">אושר ב: {new Date(booking.paymentConfirmedAt).toLocaleString("he-IL")}</p>
          )}
          {booking.paymentNotes && (
            <p className="text-[#888888] text-xs mt-1">הערות: {booking.paymentNotes}</p>
          )}
          {booking.paymentIntentId && (
            <p className="text-[#888888] text-xs mt-1">מזהה: {booking.paymentIntentId}</p>
          )}
          {booking.paymentStatus === "PENDING" &&
            booking.paymentMethod !== "MANGOPAY" && (
            <>
              <p className="text-[#888888] mt-2" dir="rtl">
                לאחר ביצוע התשלום ההזמנה תאושר לאחר אימות ידני.
              </p>
              <AdminConfirmPaymentForm bookingId={booking.id} />
            </>
          )}
          {booking.paymentStatus === "PENDING" && booking.paymentMethod === "MANGOPAY" && (
            <p className="text-[#888888] mt-2" dir="rtl">
              ממתין לתשלום ב-MangoPay — אישור אוטומטי לאחר webhook.
            </p>
          )}
        </div>
      </div>

      {["CONFIRMED", "ACTIVE", "RETURNED", "COMPLETED", "IN_DISPUTE", "DISPUTE", "NON_RETURN_PENDING", "NON_RETURN_CONFIRMED"].includes(booking.status) &&
        booking.pickupInstructionsSnapshot?.trim() && (
          <div className="rounded-[8px] border border-black/10 bg-white p-4">
            <div className="mb-2">
              <h2 className="font-sans text-[15px] font-black text-black">הוראות איסוף</h2>
            </div>
            <div className="font-assistant text-[13px] text-black">
              <p className="whitespace-pre-wrap text-foreground">{booking.pickupInstructionsSnapshot.trim()}</p>
            </div>
          </div>
        )}

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div>
          <Link href={`/bookings/${booking.id}/messages`} className="text-[#1A8C6A] hover:underline">
            צפה בהודעות ההזמנה
          </Link>
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">ביקורות</h2>
        </div>
        <div className="space-y-2 font-assistant text-[13px] text-black">
          {reviews.length === 0 ? (
            <p className="text-[#888888]">אין ביקורות להזמנה זו.</p>
          ) : (
            <ul className="space-y-2">
              {reviews.map((r: { id: string; authorName: string; targetUserName: string; rating: number; body: string | null; createdAt: string }) => (
                <li key={r.id} className="border-b border-black/10 pb-2 last:border-0">
                  <p><span className="font-sans font-bold">{r.authorName}</span> → {r.targetUserName}</p>
                  <p className="text-[#888888]">{r.rating}/5 · {new Date(r.createdAt).toLocaleString("he-IL")}</p>
                  {r.body && <p className="whitespace-pre-wrap mt-1">{r.body}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">רשימת איסוף</h2>
        </div>
        <div className="space-y-3 font-assistant text-[13px] text-black">
          {!pickupChecklist ? (
            <p className="text-[#888888]">טרם הושלמה רשימת איסוף.</p>
          ) : (
            <>
              <p>
                <span className="font-sans font-bold">סטטוס:</span>{" "}
                {pickupChecklist.completedAt ? "הושלמה" : "בטיפול"}
                {pickupChecklist.completedAt && (
                  <span className="text-[#888888]"> · {new Date(pickupChecklist.completedAt).toLocaleString("he-IL")}</span>
                )}
              </p>
              <p><span className="font-sans font-bold">אביזרים אושרו:</span> {pickupChecklist.accessoriesConfirmed ? "כן" : "לא"}</p>
              <p><span className="font-sans font-bold">מצב אושר:</span> {pickupChecklist.conditionConfirmed ? "כן" : "לא"}</p>
              {pickupChecklist.notes && (
                <div>
                  <p className="font-sans font-bold mb-1">הערות:</p>
                  <p className="text-[#888888] whitespace-pre-wrap">{pickupChecklist.notes}</p>
                </div>
              )}
            </>
          )}

          {pickupPhotos.length > 0 && (
            <div>
              <p className="font-sans font-bold mb-2">תמונות איסוף</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pickupPhotos.map((p: { angle: string; url: string }) => (
                  <div key={`pickup-${p.angle}`} className="space-y-1">
                    <p className="text-xs text-[#888888]">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-[8px] border border-black/10 overflow-hidden bg-black/[0.03] aspect-square">
                      <Image src={p.url} alt={p.angle} width={320} height={320} className="w-full h-full object-cover" unoptimized />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4">
        <div className="mb-2">
          <h2 className="font-sans text-[15px] font-black text-black">רשימת החזרה</h2>
        </div>
        <div className="space-y-3 font-assistant text-[13px] text-black">
          {!returnChecklist ? (
            <p className="text-[#888888]">טרם הושלמה רשימת החזרה.</p>
          ) : (
            <>
              <p>
                <span className="font-sans font-bold">סטטוס:</span>{" "}
                {returnChecklist.completedAt ? "הושלמה" : "בטיפול"}
                {returnChecklist.completedAt && (
                  <span className="text-[#888888]"> · {new Date(returnChecklist.completedAt).toLocaleString("he-IL")}</span>
                )}
              </p>
              <p><span className="font-sans font-bold">מצב אושר:</span> {returnChecklist.conditionConfirmed ? "כן" : "לא"}</p>
              <p><span className="font-sans font-bold">נזק לדיווח:</span> {returnChecklist.damageReported ? "כן" : "לא"}</p>
              <p><span className="font-sans font-bold">פריטים חסרים לדיווח:</span> {returnChecklist.missingItemsReported ? "כן" : "לא"}</p>
              {returnChecklist.notes && (
                <div>
                  <p className="font-sans font-bold mb-1">הערות:</p>
                  <p className="text-[#888888] whitespace-pre-wrap">{returnChecklist.notes}</p>
                </div>
              )}
            </>
          )}

          {returnPhotos.length > 0 && (
            <div>
              <p className="font-sans font-bold mb-2">תמונות החזרה</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {returnPhotos.map((p: { angle: string; url: string }) => (
                  <div key={`return-${p.angle}`} className="space-y-1">
                    <p className="text-xs text-[#888888]">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-[8px] border border-black/10 overflow-hidden bg-black/[0.03] aspect-square">
                      <Image src={p.url} alt={p.angle} width={320} height={320} className="w-full h-full object-cover" unoptimized />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {dispute && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4">
          <div className="mb-2">
            <h2 className="font-sans text-[15px] font-black text-black">מחלוקת</h2>
          </div>
          <div className="space-y-2 font-assistant text-[13px] text-black">
            <p><span className="font-sans font-bold">סיבה:</span> {dispute.reason === "damage" ? "נזק" : dispute.reason === "missing_items" ? "פריטים חסרים" : dispute.reason}</p>
            <p><span className="font-sans font-bold">סטטוס:</span> {dispute.status}</p>
            <Link href={`/admin/disputes/${dispute.id}`} className="text-[#1A8C6A] hover:underline inline-block mt-2">
              צפה במחלוקת
            </Link>
          </div>
        </div>
      )}
      </PageContainer>
    </div>
  );
}
