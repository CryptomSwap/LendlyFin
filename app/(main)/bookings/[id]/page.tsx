import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoneyIls } from "@/lib/pricing";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getBookingStatusLabelDetail,
  getBookingStatusPillVariant,
  getPaymentStatusLabel,
  getDepositStatusLabel,
} from "@/lib/status-labels";
import { BOOKING_HELP_CTA } from "@/lib/copy/help-reassurance";
import { LeaveReviewForm } from "./leave-review-form";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { PageContainer } from "@/components/layout";
import {
  getBookingLifecycleStep,
  getBookingProgressPercent,
} from "@/lib/booking-lifecycle-steps";

export const runtime = "nodejs";

type Booking = {
  id: string;
  bookingRef?: string | null;
  userId?: string;
  status:
    | "REQUESTED"
    | "CONFIRMED"
    | "ACTIVE"
    | "RETURNED"
    | "IN_DISPUTE"
    | "NON_RETURN_PENDING"
    | "NON_RETURN_CONFIRMED"
    | "COMPLETED"
    | "DISPUTE";
  startDate: string;
  endDate: string;
  listing: { title: string; deposit: number; ownerId?: string | null };
  rentalSubtotal?: number;
  serviceFee?: number;
  depositAmount?: number;
  totalDue?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;
  depositStatus?: string | null;
  disputeWindowEndsAt?: string | null;
  returnedAt?: string | null;
  pickupInstructionsSnapshot?: string | null;
  pickupChecklist?: { completedAt: string | null } | null;
  returnChecklist?: {
    completedAt: string | null;
    damageReported?: boolean;
    missingItemsReported?: boolean;
  } | null;
  dispute?: { id: string } | null;
};

async function getBooking(id: string): Promise<Booking | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/bookings/${id}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  return res.json();
}

async function getMe() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || data;
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

export default async function BookingStatusPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [booking, me, reviews] = await Promise.all([
    getBooking(id),
    getMe(),
    getReviews(id),
  ]);
  const isAdmin = !!me?.isAdmin;
  const isParticipant =
    !!me &&
    (booking?.userId === me.id ||
      (booking?.listing as { ownerId?: string } | undefined)?.ownerId === me.id);
  const hasReviewed = !!me && reviews.some((r: { authorId: string }) => r.authorId === me.id);

  if (!booking) {
    return (
      <div className="py-12 text-center" dir="rtl">
        <p className="text-foreground font-medium">הזמנה לא נמצאה</p>
        <Link href="/bookings" className="inline-block mt-2 text-primary font-medium hover:underline">
          חזרה להזמנות
        </Link>
      </div>
    );
  }

  const cta = getCTA(booking.status, booking.id);

  const isRequestedPendingPayment =
    booking.status === "REQUESTED" && booking.paymentStatus === "PENDING";

  const lifecycleStep = getBookingLifecycleStep(booking.status);
  const progressPct = getBookingProgressPercent(
    lifecycleStep.currentStep,
    lifecycleStep.totalSteps
  );

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6 lg:max-w-[72rem]">
      <h1 className="section-title">סטטוס הזמנה</h1>

      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ציר זמן</CardTitle>
          <p className="text-sm text-muted-foreground mt-1.5 text-center">
            <span className="font-medium text-foreground">
              שלב {lifecycleStep.currentStep} מתוך {lifecycleStep.totalSteps}
            </span>
            <span className="text-muted-foreground"> · {lifecycleStep.label}</span>
          </p>
          <div
            className="relative h-2 w-full rounded-full bg-muted mt-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={lifecycleStep.currentStep}
            aria-valuemin={1}
            aria-valuemax={lifecycleStep.totalSteps}
            aria-label={`שלב ${lifecycleStep.currentStep} מתוך ${lifecycleStep.totalSteps}: ${lifecycleStep.label}`}
          >
            {/* Fill grows from the right edge toward the left (RTL-friendly) */}
            <div
              className="absolute inset-y-0 right-0 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1 pt-0">
          <p>{dot(booking.status, "REQUESTED")} בקשה</p>
          <p>{dot(booking.status, "CONFIRMED")} אישור</p>
          <p>{dot(booking.status, "ACTIVE")} פעילה</p>
          <p>{dot(booking.status, "RETURNED")} הוחזר</p>
          <p>{dot(booking.status, "IN_DISPUTE")} מחלוקת</p>
          <p>{dot(booking.status, "COMPLETED")} הושלמה</p>
        </CardContent>
      </Card>

      {isRequestedPendingPayment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 text-sm">
            <p className="font-medium text-foreground mb-1">השלב הבא</p>
            <p className="text-muted-foreground">
              השלם את התשלום בדף התשלום. לאחר אימות התשלום ההזמנה תאושר ותוכל לראות הוראות איסוף.
            </p>
            <Link
              href={`/checkout?bookingId=${booking.id}`}
              className="inline-block mt-2 font-medium text-primary hover:underline"
            >
              מעבר לתשלום
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="text-sm text-muted-foreground space-y-3 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill variant={getBookingStatusPillVariant(booking.status)}>
              {getBookingStatusLabelDetail(booking.status)}
            </StatusPill>
          </div>
          {booking.bookingRef && (
            <p>
              <span className="font-medium text-foreground">מספר הזמנה: </span>
              <span className="font-mono" dir="ltr">{booking.bookingRef}</span>
            </p>
          )}
          {booking.paymentStatus && (
            <p>
              <span className="font-medium text-foreground">תשלום: </span>
              {getPaymentStatusLabel(booking.paymentStatus)}
            </p>
          )}
          <p>{booking.listing.title}</p>
          <p>
            {fmt(booking.startDate)} → {fmt(booking.endDate)}
          </p>
          <p>פיקדון: {formatMoneyIls(booking.depositAmount ?? booking.listing.deposit)}</p>
        </CardContent>
      </Card>

      {(booking.rentalSubtotal != null || booking.totalDue != null) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">סיכום תשלום</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {booking.paymentStatus && (
              <p>
                <span className="font-medium text-foreground">סטטוס תשלום: </span>
                <span className="text-muted-foreground">{getPaymentStatusLabel(booking.paymentStatus)}</span>
              </p>
            )}
            {booking.rentalSubtotal != null && (
              <p className="text-muted-foreground">השכרה: {formatMoneyIls(booking.rentalSubtotal)}</p>
            )}
            {booking.serviceFee != null && booking.serviceFee > 0 && (
              <p className="text-muted-foreground">עמלת פלטפורמה: {formatMoneyIls(booking.serviceFee)}</p>
            )}
            {booking.depositAmount != null && (
              <p className="text-muted-foreground">פיקדון: {formatMoneyIls(booking.depositAmount)}</p>
            )}
            {booking.totalDue != null && (
              <p className="font-medium text-foreground">סה״כ: {formatMoneyIls(booking.totalDue)}</p>
            )}
            {booking.depositStatus && booking.depositStatus !== "PENDING" && (
              <p className="text-muted-foreground">
                פיקדון: {getDepositStatusLabel(booking.depositStatus)}
              </p>
            )}
            {booking.paymentStatus === "PENDING" && (
              <p className="text-muted-foreground mt-2">
                לאחר ביצוע התשלום ההזמנה תאושר לאחר אימות ידני. ניתן לחזור לדף זה כדי לראות עדכון.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {["CONFIRMED", "ACTIVE", "RETURNED", "COMPLETED", "IN_DISPUTE", "DISPUTE", "NON_RETURN_PENDING", "NON_RETURN_CONFIRMED"].includes(booking.status) &&
        booking.pickupInstructionsSnapshot?.trim() && (
          <Card>
            <CardHeader>
              <CardTitle>הוראות איסוף</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{booking.pickupInstructionsSnapshot.trim()}</p>
            </CardContent>
          </Card>
        )}

      {booking.status === "CONFIRMED" && (
        <Card>
          <CardHeader>
            <CardTitle>רשימת איסוף</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.pickupChecklist?.completedAt ? (
              <p className="text-sm text-muted-foreground">רשימת האיסוף הושלמה. ההזמנה מוכנה להפעלה.</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                יש להשלים את רשימת האיסוף (תיעוד מצב הפריט ותמונות) לפני שההזמנה תעבור לפעילה.
              </p>
            )}
            <Link href={`/bookings/${booking.id}/pickup`}>
              <Button variant={booking.pickupChecklist?.completedAt ? "outline" : "default"} className="w-full">
                {booking.pickupChecklist?.completedAt ? "צפה ברשימת איסוף" : "השלם רשימת איסוף"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {booking.status === "ACTIVE" && booking.pickupChecklist?.completedAt && !booking.returnChecklist?.completedAt && (
        <Card>
          <CardHeader>
            <CardTitle>רשימת החזרה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              החזר את הפריט ותעד את מצבו. לאחר השלמת רשימת ההחזרה ההזמנה תעבור להושלמה (או לבדיקה אם דווח נזק/פריטים חסרים).
            </p>
            <Link href={`/bookings/${booking.id}/return`}>
              <Button className="w-full">השלם רשימת החזרה</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {booking.status === "ACTIVE" && booking.returnChecklist?.completedAt && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            ✔ רשימת החזרה הושלמה
          </CardContent>
        </Card>
      )}

      {booking.status === "RETURNED" && (
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">הפריט הוחזר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>חלון מחלוקת של 48 שעות פתוח לאחר ההחזרה.</p>
            {booking.disputeWindowEndsAt && (
              <p>
                ניתן לפתוח מחלוקת עד{" "}
                {new Date(booking.disputeWindowEndsAt).toLocaleString("he-IL")}
              </p>
            )}
            <Link href={`/bookings/${booking.id}/dispute`} className="text-primary hover:underline inline-block mt-1 font-medium">
              פתח מחלוקת
            </Link>
          </CardContent>
        </Card>
      )}

      {booking.status === "COMPLETED" && (
        <>
          <Card className="shadow-soft">
            <CardContent className="py-4 text-sm text-muted-foreground">
              ✔ ההזמנה הושלמה. רשימת ההחזרה תועדה.
            </CardContent>
          </Card>
          <section aria-label="ביקורות">
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ביקורות</CardTitle>
                <p className="text-sm text-muted-foreground">
                  ביקורות מהמשתתפים בהזמנה. דירוגך עוזר לקהילה.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="font-medium text-foreground">אין ביקורות עדיין</p>
                    <p className="text-sm text-muted-foreground mt-0.5 max-w-sm">
                      {isParticipant && !hasReviewed
                        ? "השאר ביקורת למטה — דירוגך עוזר לאחרים."
                        : "עדיין לא נכתבו ביקורות להזמנה זו."}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4 list-none p-0 m-0">
                    {reviews.map((r: { id: string; authorName: string; targetUserName: string; rating: number; body: string | null; createdAt: string }) => (
                      <li key={r.id}>
                        <ReviewCard
                          authorName={r.authorName}
                          targetUserName={r.targetUserName}
                          rating={r.rating}
                          body={r.body}
                          createdAt={r.createdAt}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {isParticipant && !hasReviewed && (
              <div className="mt-4">
                <LeaveReviewForm bookingId={booking.id} />
              </div>
            )}
          </section>
        </>
      )}

      {(booking.status === "IN_DISPUTE" || booking.status === "DISPUTE") && (
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">הזמנה בבדיקה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              דווחו נזק או פריטים חסרים בהחזרה. ההזמנה בבדיקה.
            </p>
            {booking.returnChecklist?.damageReported && (
              <p className="text-muted-foreground">· נזק לדיווח</p>
            )}
            {booking.returnChecklist?.missingItemsReported && (
              <p className="text-muted-foreground">· פריטים חסרים לדיווח</p>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
              הצוות בודק את המחלוקת ויחזור עם החלטה. עקבו אחר העדכונים כאן.
            </p>
            {isAdmin && booking.dispute && (
              <Link href={`/admin/disputes/${booking.dispute.id}`} className="text-primary hover:underline inline-block mt-2 font-medium">
                צפה במחלוקת (מנהל)
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {booking.status === "NON_RETURN_PENDING" && (
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">אי-החזרה בבדיקה</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            האירוע סומן לבדיקה על ידי צוות התמיכה. נעדכן בהמשך לגבי החלטה סופית.
          </CardContent>
        </Card>
      )}

      {booking.status === "NON_RETURN_CONFIRMED" && (
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">אי-החזרה אושרה</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ההזמנה הוסלמה לאי-החזרה מאושרת ומטופלת על ידי הנהלת הפיילוט.
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardContent className="py-4">
          <Link href={`/bookings/${booking.id}/messages`}>
            <Button variant="outline" className="w-full justify-center">
              הודעות / צור קשר
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            תאמו עם המלווה או השוכר לגבי ההזמנה. ההודעות שמורות להקשר ההזמנה.
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mb-1">
        פיקדון מוחזר בהתאם למצב הפריט. תמיכה זמינה לכל שאלה.
      </p>
      <p className="text-xs text-muted-foreground text-center mb-2">
        {BOOKING_HELP_CTA.line}{" "}
        <Link href={BOOKING_HELP_CTA.href} className="text-primary font-medium hover:underline">
          {BOOKING_HELP_CTA.label}
        </Link>
      </p>
      <StickyCTA width="narrow">
        <div className="space-y-3">
          {cta.href ? (
            <Link href={cta.href}>
              <Button className="w-full">{cta.label}</Button>
            </Link>
          ) : (
            <Button className="w-full" disabled>
              {cta.label}
            </Button>
          )}
          <TrustCTARow />
        </div>
      </StickyCTA>
      </PageContainer>
    </div>
  );
}

function fmt(d: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function getCTA(status: Booking["status"], bookingId: string) {
  switch (status) {
    case "REQUESTED":
      return { label: "השלם תשלום", href: `/checkout?bookingId=${bookingId}` };
    case "CONFIRMED":
      return { label: "רשימת איסוף", href: `/bookings/${bookingId}/pickup` };
    case "ACTIVE":
      return { label: "רשימת החזרה", href: `/bookings/${bookingId}/return` };
    case "RETURNED":
      return { label: "פתח מחלוקת", href: `/bookings/${bookingId}/dispute` };
    case "IN_DISPUTE":
      return { label: "מחלוקת פתוחה", href: "" };
    case "NON_RETURN_PENDING":
      return { label: "בטיפול צוות", href: "" };
    case "NON_RETURN_CONFIRMED":
      return { label: "אי-החזרה אושרה", href: "" };
    case "COMPLETED":
      return { label: "השאר ביקורת", href: "" };
    case "DISPUTE":
      return { label: "צפה במחלוקת", href: "" };
  }
}

function dot(current: Booking["status"], step: Booking["status"]) {
  const order: Booking["status"][] = [
    "REQUESTED",
    "CONFIRMED",
    "ACTIVE",
    "RETURNED",
    "IN_DISPUTE",
    "COMPLETED",
    "DISPUTE",
    "NON_RETURN_PENDING",
    "NON_RETURN_CONFIRMED",
  ];

  if (current === step) return "●";
  if (order.indexOf(current) > order.indexOf(step)) return "✔";
  return "○";
}
