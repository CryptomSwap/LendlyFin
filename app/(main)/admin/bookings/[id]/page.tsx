export const runtime = "nodejs";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoneyIls } from "@/lib/pricing";
import { getBookingStatusLabel, getPaymentStatusLabel, getDepositStatusLabel } from "@/lib/status-labels";
import { AdminConfirmPaymentForm } from "./confirm-payment-form";

async function getBooking(id: string) {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/admin/bookings/${id}`, {
    cache: "no-store",
    headers: { cookie: headers().get("cookie") ?? "" },
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
        <Link href="/admin" className="text-primary underline mt-2 inline-block">חזרה</Link>
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
    <div className="space-y-6 pb-24" dir="rtl">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה למנהל
        </Link>
      </div>

      <h1 className="page-title">הזמנה – צפייה מנהל</h1>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          {booking.bookingRef && (
            <p><span className="font-medium">מספר הזמנה:</span> <span className="font-mono" dir="ltr">{booking.bookingRef}</span></p>
          )}
          <p><span className="font-medium">סטטוס:</span> {getBookingStatusLabel(booking.status)}</p>
          <p><span className="font-medium">מודעה:</span> {booking.listing?.title}</p>
          <p><span className="font-medium">שוכר:</span> {booking.user?.name}</p>
          <p>
            <span className="font-medium">תאריכים:</span>{" "}
            {new Date(booking.startDate).toLocaleDateString("he-IL")} – {new Date(booking.endDate).toLocaleDateString("he-IL")}
          </p>
          <p><span className="font-medium">פיקדון:</span> {booking.listing ? formatMoneyIls(booking.listing.deposit) : "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תשלום ופיקדון</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          {booking.bookingRef && (
            <p><span className="font-medium">מספר הזמנה (להתאמה מול Bit):</span> <span className="font-mono" dir="ltr">{booking.bookingRef}</span></p>
          )}
          <p><span className="font-medium">השכרה:</span> {formatMoneyIls(booking.rentalSubtotal ?? 0)}</p>
          <p><span className="font-medium">עמלת פלטפורמה:</span> {formatMoneyIls(booking.serviceFee ?? 0)}</p>
          <p><span className="font-medium">פיקדון (סכום):</span> {formatMoneyIls(booking.depositAmount ?? 0)}</p>
          <p><span className="font-medium">סה״כ לתשלום:</span> {formatMoneyIls(booking.totalDue ?? 0)}</p>
          <p><span className="font-medium">סטטוס תשלום:</span> {getPaymentStatusLabel(booking.paymentStatus)}</p>
          <p><span className="font-medium">סטטוס פיקדון:</span> {getDepositStatusLabel(booking.depositStatus)}</p>
          {booking.paymentMethod && (
            <p><span className="font-medium">אמצעי תשלום:</span> {booking.paymentMethod === "MANUAL_BIT" ? "Bit (ידני)" : booking.paymentMethod}</p>
          )}
          {booking.paymentLink && (
            <p className="text-muted-foreground text-xs mt-1">קישור תשלום: <a href={booking.paymentLink} target="_blank" rel="noopener noreferrer" className="underline">Bit</a></p>
          )}
          {booking.paymentConfirmedAt && (
            <p className="text-muted-foreground text-xs mt-1">אושר ב: {new Date(booking.paymentConfirmedAt).toLocaleString("he-IL")}</p>
          )}
          {booking.paymentNotes && (
            <p className="text-muted-foreground text-xs mt-1">הערות: {booking.paymentNotes}</p>
          )}
          {booking.paymentIntentId && (
            <p className="text-muted-foreground text-xs mt-1">מזהה: {booking.paymentIntentId}</p>
          )}
          {booking.paymentStatus === "PENDING" && (
            <>
              <p className="text-muted-foreground mt-2" dir="rtl">
                לאחר ביצוע התשלום ההזמנה תאושר לאחר אימות ידני.
              </p>
              <AdminConfirmPaymentForm bookingId={booking.id} />
            </>
          )}
        </CardContent>
      </Card>

      {["CONFIRMED", "ACTIVE", "COMPLETED", "DISPUTE"].includes(booking.status) &&
        booking.pickupInstructionsSnapshot?.trim() && (
          <Card>
            <CardHeader>
              <CardTitle>הוראות איסוף</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="whitespace-pre-wrap text-foreground">{booking.pickupInstructionsSnapshot.trim()}</p>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardContent className="py-4">
          <Link href={`/bookings/${booking.id}/messages`} className="text-primary hover:underline">
            צפה בהודעות ההזמנה
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ביקורות</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">אין ביקורות להזמנה זו.</p>
          ) : (
            <ul className="space-y-2">
              {reviews.map((r: { id: string; authorName: string; targetUserName: string; rating: number; body: string | null; createdAt: string }) => (
                <li key={r.id} className="border-b border-border pb-2 last:border-0">
                  <p><span className="font-medium">{r.authorName}</span> → {r.targetUserName}</p>
                  <p className="text-muted-foreground">{r.rating}/5 · {new Date(r.createdAt).toLocaleString("he-IL")}</p>
                  {r.body && <p className="whitespace-pre-wrap mt-1">{r.body}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת איסוף</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!pickupChecklist ? (
            <p className="text-muted-foreground">טרם הושלמה רשימת איסוף.</p>
          ) : (
            <>
              <p>
                <span className="font-medium">סטטוס:</span>{" "}
                {pickupChecklist.completedAt ? "הושלמה" : "בטיפול"}
                {pickupChecklist.completedAt && (
                  <span className="text-muted-foreground"> · {new Date(pickupChecklist.completedAt).toLocaleString("he-IL")}</span>
                )}
              </p>
              <p><span className="font-medium">אביזרים אושרו:</span> {pickupChecklist.accessoriesConfirmed ? "כן" : "לא"}</p>
              <p><span className="font-medium">מצב אושר:</span> {pickupChecklist.conditionConfirmed ? "כן" : "לא"}</p>
              {pickupChecklist.notes && (
                <div>
                  <p className="font-medium mb-1">הערות:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{pickupChecklist.notes}</p>
                </div>
              )}
            </>
          )}

          {pickupPhotos.length > 0 && (
            <div>
              <p className="font-medium mb-2">תמונות איסוף</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {pickupPhotos.map((p: { angle: string; url: string }) => (
                  <div key={`pickup-${p.angle}`} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border overflow-hidden bg-muted aspect-square">
                      <img src={p.url} alt={p.angle} className="w-full h-full object-cover" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>רשימת החזרה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!returnChecklist ? (
            <p className="text-muted-foreground">טרם הושלמה רשימת החזרה.</p>
          ) : (
            <>
              <p>
                <span className="font-medium">סטטוס:</span>{" "}
                {returnChecklist.completedAt ? "הושלמה" : "בטיפול"}
                {returnChecklist.completedAt && (
                  <span className="text-muted-foreground"> · {new Date(returnChecklist.completedAt).toLocaleString("he-IL")}</span>
                )}
              </p>
              <p><span className="font-medium">מצב אושר:</span> {returnChecklist.conditionConfirmed ? "כן" : "לא"}</p>
              <p><span className="font-medium">נזק לדיווח:</span> {returnChecklist.damageReported ? "כן" : "לא"}</p>
              <p><span className="font-medium">פריטים חסרים לדיווח:</span> {returnChecklist.missingItemsReported ? "כן" : "לא"}</p>
              {returnChecklist.notes && (
                <div>
                  <p className="font-medium mb-1">הערות:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{returnChecklist.notes}</p>
                </div>
              )}
            </>
          )}

          {returnPhotos.length > 0 && (
            <div>
              <p className="font-medium mb-2">תמונות החזרה</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {returnPhotos.map((p: { angle: string; url: string }) => (
                  <div key={`return-${p.angle}`} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{ANGLE_LABELS[p.angle] ?? p.angle}</p>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border overflow-hidden bg-muted aspect-square">
                      <img src={p.url} alt={p.angle} className="w-full h-full object-cover" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {dispute && (
        <Card>
          <CardHeader>
            <CardTitle>מחלוקת</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="font-medium">סיבה:</span> {dispute.reason === "damage" ? "נזק" : dispute.reason === "missing_items" ? "פריטים חסרים" : dispute.reason}</p>
            <p><span className="font-medium">סטטוס:</span> {dispute.status}</p>
            <Link href={`/admin/disputes/${dispute.id}`} className="text-primary hover:underline inline-block mt-2">
              צפה במחלוקת
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
