import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { formatMoneyIls } from "@/lib/pricing";
import { RedesignStatusPill, type RedesignStatusVariant } from "@/components/redesign/status-pill";
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
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const PRIMARY_BTN =
  "w-full rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)] transition-all duration-300";
const SECONDARY_BTN =
  "w-full rounded-full border border-black/15 bg-white font-sans font-bold text-black shadow-none hover:bg-black/5";

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
  startDate: string | Date;
  endDate: string | Date;
  listing: { title: string; deposit: number; ownerId?: string | null };
  rentalSubtotal?: number;
  serviceFee?: number;
  depositAmount?: number;
  totalDue?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;
  depositStatus?: string | null;
  disputeWindowEndsAt?: string | Date | null;
  returnedAt?: string | Date | null;
  pickupInstructionsSnapshot?: string | null;
  pickupChecklist?: { completedAt: string | Date | null } | null;
  returnChecklist?: {
    completedAt: string | Date | null;
    damageReported?: boolean;
    missingItemsReported?: boolean;
  } | null;
  dispute?: { id: string } | null;
};

function toRedesignVariant(
  variant: ReturnType<typeof getBookingStatusPillVariant>
): RedesignStatusVariant {
  return variant === "primary" ? "brand" : variant;
}

async function getBooking(id: string): Promise<Booking | null> {
  const me = await getMe();
  if (!me) return null;

  let booking: Booking | null = null;
  try {
    booking = (await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: "asc" } },
          },
        },
        pickupChecklist: true,
        returnChecklist: true,
        checklistPhotos: true,
        dispute: true,
      },
    })) as unknown as Booking | null;
  } catch (error) {
    // Prevent hard crash when deployment DB is behind current Prisma schema.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022" || error.code === "P2010") {
        return null;
      }
    }
    throw error;
  }

  if (!booking) return null;
  const isRenter = booking.userId === me.id;
  const isLender = booking.listing?.ownerId != null && booking.listing.ownerId === me.id;
  if (!isRenter && !isLender && !me.isAdmin) return null;
  return booking;
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
  try {
    const reviews = await prisma.review.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        targetUser: { select: { id: true, name: true } },
      },
    });
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      authorId: r.authorId,
      authorName: r.author.name,
      targetUserId: r.targetUserId,
      targetUserName: r.targetUser.name,
    }));
  } catch (error) {
    // Keep booking details usable even if review table/query is unavailable.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2010") {
        return [];
      }
    }
    throw error;
  }
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
      <div className="min-h-screen w-full bg-white pb-24 py-12 text-center" dir="rtl">
        <p className="font-sans font-bold text-black">הזמנה לא נמצאה</p>
        <Link href="/bookings" className="inline-block mt-2 font-sans font-bold text-[#1A8C6A] hover:underline">
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
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-6 lg:max-w-[72rem]">
      <h1 className="page-title">סטטוס הזמנה</h1>

      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-3">
        <h2 className="font-sans text-base font-bold text-black">ציר זמן</h2>
        <p className="font-assistant text-[14px] text-[#888888] text-center">
          <span className="font-sans font-bold text-black">
            שלב {lifecycleStep.currentStep} מתוך {lifecycleStep.totalSteps}
          </span>
          <span> · {lifecycleStep.label}</span>
        </p>
        <div
          className="relative h-2 w-full rounded-full bg-black/8 overflow-hidden"
          role="progressbar"
          aria-valuenow={lifecycleStep.currentStep}
          aria-valuemin={1}
          aria-valuemax={lifecycleStep.totalSteps}
          aria-label={`שלב ${lifecycleStep.currentStep} מתוך ${lifecycleStep.totalSteps}: ${lifecycleStep.label}`}
        >
          {/* Fill grows from the right edge toward the left (RTL-friendly) */}
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-[#1A8C6A] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="font-assistant text-[14px] text-[#888888] space-y-1 pt-1">
          <p>{dot(booking.status, "REQUESTED")} בקשה</p>
          <p>{dot(booking.status, "CONFIRMED")} אישור</p>
          <p>{dot(booking.status, "ACTIVE")} פעילה</p>
          <p>{dot(booking.status, "RETURNED")} הוחזר</p>
          <p>{dot(booking.status, "IN_DISPUTE")} מחלוקת</p>
          <p>{dot(booking.status, "COMPLETED")} הושלמה</p>
        </div>
      </div>

      {isRequestedPendingPayment && (
        <div className="rounded-[8px] border border-[#1A8C6A]/20 bg-[#F0FAF6] p-4 md:p-6 space-y-2">
          <p className="font-sans font-bold text-black">השלב הבא</p>
          <p className="font-assistant text-[14px] text-[#888888]">
            השלם את התשלום בדף התשלום. לאחר אימות התשלום ההזמנה תאושר ותוכל לראות הוראות איסוף.
          </p>
          <Link
            href={`/checkout?bookingId=${booking.id}`}
            className="inline-block mt-1 font-sans font-bold text-[#1A8C6A] hover:underline"
          >
            מעבר לתשלום
          </Link>
        </div>
      )}

      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <RedesignStatusPill variant={toRedesignVariant(getBookingStatusPillVariant(booking.status))}>
            {getBookingStatusLabelDetail(booking.status)}
          </RedesignStatusPill>
        </div>
        {booking.bookingRef && (
          <p className="font-assistant text-[14px] text-[#888888]">
            <span className="font-sans font-bold text-black">מספר הזמנה: </span>
            <span className="font-mono" dir="ltr">{booking.bookingRef}</span>
          </p>
        )}
        {booking.paymentStatus && (
          <p className="font-assistant text-[14px] text-[#888888]">
            <span className="font-sans font-bold text-black">תשלום: </span>
            {getPaymentStatusLabel(booking.paymentStatus)}
          </p>
        )}
        <p className="font-sans font-bold text-black">{booking.listing.title}</p>
        <p className="font-assistant text-[14px] text-[#888888]">
          {fmt(booking.startDate)} → {fmt(booking.endDate)}
        </p>
        <p className="font-assistant text-[14px] text-[#888888]">
          פיקדון: {formatMoneyIls(booking.depositAmount ?? booking.listing.deposit)}
        </p>
      </div>

      {(booking.rentalSubtotal != null || booking.totalDue != null) && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
          <h2 className="font-sans text-base font-bold text-black">סיכום תשלום</h2>
          {booking.paymentStatus && (
            <p className="font-assistant text-[14px] text-[#888888]">
              <span className="font-sans font-bold text-black">סטטוס תשלום: </span>
              {getPaymentStatusLabel(booking.paymentStatus)}
            </p>
          )}
          {booking.rentalSubtotal != null && (
            <p className="font-assistant text-[14px] text-[#888888]">השכרה: {formatMoneyIls(booking.rentalSubtotal)}</p>
          )}
          {booking.serviceFee != null && booking.serviceFee > 0 && (
            <p className="font-assistant text-[14px] text-[#888888]">עמלת פלטפורמה: {formatMoneyIls(booking.serviceFee)}</p>
          )}
          {booking.depositAmount != null && (
            <p className="font-assistant text-[14px] text-[#888888]">פיקדון: {formatMoneyIls(booking.depositAmount)}</p>
          )}
          {booking.totalDue != null && (
            <p className="font-sans font-bold text-black">סה״כ: {formatMoneyIls(booking.totalDue)}</p>
          )}
          {booking.depositStatus && booking.depositStatus !== "PENDING" && (
            <p className="font-assistant text-[14px] text-[#888888]">
              פיקדון: {getDepositStatusLabel(booking.depositStatus)}
            </p>
          )}
          {booking.paymentStatus === "PENDING" && (
            <p className="font-assistant text-[14px] text-[#888888] mt-2">
              לאחר ביצוע התשלום ההזמנה תאושר לאחר אימות ידני. ניתן לחזור לדף זה כדי לראות עדכון.
            </p>
          )}
        </div>
      )}

      {["CONFIRMED", "ACTIVE", "RETURNED", "COMPLETED", "IN_DISPUTE", "DISPUTE", "NON_RETURN_PENDING", "NON_RETURN_CONFIRMED"].includes(booking.status) &&
        booking.pickupInstructionsSnapshot?.trim() && (
          <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
            <h2 className="font-sans text-base font-bold text-black">הוראות איסוף</h2>
            <p className="font-assistant text-[14px] text-[#888888] whitespace-pre-wrap">
              {booking.pickupInstructionsSnapshot.trim()}
            </p>
          </div>
        )}

      {booking.status === "CONFIRMED" && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-3">
          <h2 className="font-sans text-base font-bold text-black">רשימת איסוף</h2>
          {booking.pickupChecklist?.completedAt ? (
            <p className="font-assistant text-[14px] text-[#888888]">רשימת האיסוף הושלמה. ההזמנה מוכנה להפעלה.</p>
          ) : (
            <p className="font-assistant text-[14px] text-[#888888]">
              יש להשלים את רשימת האיסוף (תיעוד מצב הפריט ותמונות) לפני שההזמנה תעבור לפעילה.
            </p>
          )}
          <Link href={`/bookings/${booking.id}/pickup`}>
            <Button
              variant={booking.pickupChecklist?.completedAt ? "outline" : "default"}
              className={booking.pickupChecklist?.completedAt ? SECONDARY_BTN : PRIMARY_BTN}
            >
              {booking.pickupChecklist?.completedAt ? "צפה ברשימת איסוף" : "השלם רשימת איסוף"}
            </Button>
          </Link>
        </div>
      )}

      {booking.status === "ACTIVE" && booking.pickupChecklist?.completedAt && !booking.returnChecklist?.completedAt && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-3">
          <h2 className="font-sans text-base font-bold text-black">רשימת החזרה</h2>
          <p className="font-assistant text-[14px] text-[#888888]">
            החזר את הפריט ותעד את מצבו. לאחר השלמת רשימת ההחזרה ההזמנה תעבור להושלמה (או לבדיקה אם דווח נזק/פריטים חסרים).
          </p>
          <Link href={`/bookings/${booking.id}/return`}>
            <Button className={PRIMARY_BTN}>השלם רשימת החזרה</Button>
          </Link>
        </div>
      )}

      {booking.status === "ACTIVE" && booking.returnChecklist?.completedAt && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
          <p className="font-assistant text-[14px] text-[#888888]">✔ רשימת החזרה הושלמה</p>
        </div>
      )}

      {booking.status === "RETURNED" && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
          <h2 className="font-sans text-base font-bold text-black">הפריט הוחזר</h2>
          <p className="font-assistant text-[14px] text-[#888888]">חלון מחלוקת של 48 שעות פתוח לאחר ההחזרה.</p>
          {booking.disputeWindowEndsAt && (
            <p className="font-assistant text-[14px] text-[#888888]">
              ניתן לפתוח מחלוקת עד{" "}
              {new Date(booking.disputeWindowEndsAt).toLocaleString("he-IL")}
            </p>
          )}
          <Link href={`/bookings/${booking.id}/dispute`} className="font-sans font-bold text-[#1A8C6A] hover:underline inline-block mt-1">
            פתח מחלוקת
          </Link>
        </div>
      )}

      {booking.status === "COMPLETED" && (
        <>
          <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
            <p className="font-assistant text-[14px] text-[#888888]">
              ✔ ההזמנה הושלמה. רשימת ההחזרה תועדה.
            </p>
          </div>
          <section aria-label="ביקורות">
            <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-4">
              <div>
                <h2 className="font-sans text-base font-bold text-black">ביקורות</h2>
                <p className="font-assistant text-[14px] text-[#888888] mt-1">
                  ביקורות מהמשתתפים בהזמנה. דירוגך עוזר לקהילה.
                </p>
              </div>
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="font-sans font-bold text-black">אין ביקורות עדיין</p>
                  <p className="font-assistant text-[14px] text-[#888888] mt-0.5 max-w-sm">
                    {isParticipant && !hasReviewed
                      ? "השאר ביקורת למטה — דירוגך עוזר לאחרים."
                      : "עדיין לא נכתבו ביקורות להזמנה זו."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-4 list-none p-0 m-0">
                  {reviews.map((r) => (
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
            </div>
            {isParticipant && !hasReviewed && (
              <div className="mt-4">
                <LeaveReviewForm bookingId={booking.id} />
              </div>
            )}
          </section>
        </>
      )}

      {(booking.status === "IN_DISPUTE" || booking.status === "DISPUTE") && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
          <h2 className="font-sans text-base font-bold text-black">הזמנה בבדיקה</h2>
          <p className="font-assistant text-[14px] text-[#888888]">
            דווחו נזק או פריטים חסרים בהחזרה. ההזמנה בבדיקה.
          </p>
          {booking.returnChecklist?.damageReported && (
            <p className="font-assistant text-[14px] text-[#888888]">· נזק לדיווח</p>
          )}
          {booking.returnChecklist?.missingItemsReported && (
            <p className="font-assistant text-[14px] text-[#888888]">· פריטים חסרים לדיווח</p>
          )}
          <p className="font-assistant text-[12px] text-[#888888] pt-2 border-t border-black/10 mt-2">
            הצוות בודק את המחלוקת ויחזור עם החלטה. עקבו אחר העדכונים כאן.
          </p>
          {isAdmin && booking.dispute && (
            <Link href={`/admin/disputes/${booking.dispute.id}`} className="font-sans font-bold text-[#1A8C6A] hover:underline inline-block mt-2">
              צפה במחלוקת (מנהל)
            </Link>
          )}
        </div>
      )}

      {booking.status === "NON_RETURN_PENDING" && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
          <h2 className="font-sans text-base font-bold text-black">אי-החזרה בבדיקה</h2>
          <p className="font-assistant text-[14px] text-[#888888]">
            האירוע סומן לבדיקה על ידי צוות התמיכה. נעדכן בהמשך לגבי החלטה סופית.
          </p>
        </div>
      )}

      {booking.status === "NON_RETURN_CONFIRMED" && (
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
          <h2 className="font-sans text-base font-bold text-black">אי-החזרה אושרה</h2>
          <p className="font-assistant text-[14px] text-[#888888]">
            ההזמנה הוסלמה לאי-החזרה מאושרת ומטופלת על ידי הנהלת הפיילוט.
          </p>
        </div>
      )}

      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
        <Link href={`/bookings/${booking.id}/messages`}>
          <Button variant="outline" className={SECONDARY_BTN}>
            הודעות / צור קשר
          </Button>
        </Link>
        <p className="font-assistant text-[12px] text-[#888888] mt-2 text-center">
          תאמו עם המלווה או השוכר לגבי ההזמנה. ההודעות שמורות להקשר ההזמנה.
        </p>
      </div>

      <p className="font-assistant text-[12px] text-[#888888] text-center mb-1">
        פיקדון מוחזר בהתאם למצב הפריט. תמיכה זמינה לכל שאלה.
      </p>
      <p className="font-assistant text-[12px] text-[#888888] text-center mb-2">
        {BOOKING_HELP_CTA.line}{" "}
        <Link href={BOOKING_HELP_CTA.href} className="font-sans font-bold text-[#1A8C6A] hover:underline">
          {BOOKING_HELP_CTA.label}
        </Link>
      </p>
      <StickyCTA width="narrow">
        <div className="space-y-3">
          {cta.href ? (
            <Link href={cta.href}>
              <Button className={PRIMARY_BTN}>{cta.label}</Button>
            </Link>
          ) : (
            <Button className={PRIMARY_BTN} disabled>
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

function fmt(d: string | Date) {
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
