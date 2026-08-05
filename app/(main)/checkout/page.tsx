"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { Alert } from "@/components/ui/alert";
import { FAQBlock } from "@/components/ui/faq-block";
import { LoadingBlock } from "@/components/ui/loading-block";
import { PageContainer } from "@/components/layout";
import { formatMoneyIls } from "@/lib/pricing";
import { PAYMENT_FAQ_ITEMS } from "@/lib/copy/help-reassurance";

type PaymentProvider = "mangopay" | "manual_bit" | "mock";

type Summary = {
  bookingId: string;
  bookingRef?: string | null;
  title: string;
  startDate: string;
  endDate: string;
  rentalSubtotal: number;
  depositAmount: number;
  serviceFee?: number;
  totalDue?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;
  paymentLink?: string | null;
  paymentProvider?: PaymentProvider;
};

const PRIMARY_BTN =
  "w-full rounded-full bg-[#1A8C6A] font-sans font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] hover:bg-[#167A5C] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,140,106,0.45)] transition-all duration-300";

function fmt(d: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paidReturn = searchParams.get("paid") === "1";
  const canceledReturn = searchParams.get("canceled") === "1";

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    (async () => {
      const res = await fetch("/api/checkout/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        setSummary(null);
        return;
      }

      setSummary(await res.json());
    })();
  }, [bookingId]);

  async function handlePay() {
    if (!bookingId) return;

    setLoading(true);
    setPayError(null);

    const res = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setPayError(data?.error ?? "שגיאה בהכנת התשלום");
      return;
    }

    const redirectUrl = data.checkoutUrl ?? data.paymentLink;
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }

    setPayError("קישור התשלום לא זמין. נא ליצור קשר.");
  }

  if (!bookingId) {
    return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-4 max-w-2xl">
        <Alert variant="default">חסר פרטי הזמנה. יש לגשת מהזמנה או מהקישור שנשלח.</Alert>
      </PageContainer>
    </div>
    );
  }
  if (!summary) {
    return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-4 max-w-2xl">
        <h1 className="page-title">תשלום</h1>
        <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
          <LoadingBlock message="טוען פרטי הזמנה..." variant="full" />
        </div>
      </PageContainer>
    </div>
    );
  }

  const totalNow = summary.totalDue ?? summary.rentalSubtotal + summary.depositAmount + (summary.serviceFee ?? 0);
  const provider = summary.paymentProvider ?? "mangopay";
  const isMangopay = provider === "mangopay";
  const isConfirmed = summary.paymentStatus === "SUCCEEDED";

  return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-6 max-w-2xl">
      <h1 className="page-title">תשלום</h1>

      {paidReturn && (
        <Alert variant="default">
          {isConfirmed
            ? "התשלום התקבל וההזמנה אושרה. ניתן לעקוב בדף ההזמנה."
            : "התשלום התקבל. מאשרים את ההזמנה — רעננו בעוד רגע או עברו לדף ההזמנה."}
        </Alert>
      )}

      {canceledReturn && (
        <Alert variant="default">התשלום בוטל. אפשר לנסות שוב בלחיצה על כפתור התשלום.</Alert>
      )}

      <div className="rounded-[8px] border border-[#1A8C6A]/20 bg-[#F0FAF6] p-4 md:p-6 space-y-2">
        <h2 className="font-sans text-base font-bold text-black">מה לעשות עכשיו</h2>
        <div className="font-assistant text-[14px] text-[#888888] space-y-2">
          <p className="flex gap-2">
            <span className="font-sans font-bold text-black shrink-0">1.</span>
            לחצו על כפתור התשלום למטה.
          </p>
          <p className="flex gap-2">
            <span className="font-sans font-bold text-black shrink-0">2.</span>
            השלימו את התשלום בעמוד התשלום המאובטח (כרטיס אשראי).
          </p>
          <p className="flex gap-2">
            <span className="font-sans font-bold text-black shrink-0">3.</span>
            ההזמנה תאושר אוטומטית לאחר תשלום מוצלח.
          </p>
        </div>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-1">
        <h2 className="font-sans text-base font-bold text-black mb-2">סיכום הזמנה</h2>
        <p className="font-sans font-bold text-black">{summary.title}</p>
        <p className="font-assistant text-[14px] text-[#888888]">
          {fmt(summary.startDate)} → {fmt(summary.endDate)}
        </p>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6 space-y-2">
        <h2 className="font-sans text-base font-bold text-black mb-2">פירוט תשלום</h2>
        <p className="font-assistant text-[14px] text-[#888888]">השכרה: {formatMoneyIls(summary.rentalSubtotal)}</p>
        {typeof summary.serviceFee === "number" && summary.serviceFee > 0 && (
          <p className="font-assistant text-[14px] text-[#888888]">עמלת פלטפורמה: {formatMoneyIls(summary.serviceFee)}</p>
        )}
        <p className="font-assistant text-[14px] text-[#888888]">פיקדון (מוחזר): {formatMoneyIls(summary.depositAmount)}</p>
        <hr className="border-black/10" />
        <p className="font-sans font-bold text-black text-base">
          סה״כ לתשלום עכשיו: {formatMoneyIls(totalNow)}
        </p>
      </div>

      {summary.paymentStatus === "PENDING" && isMangopay && (
        <p className="font-assistant text-[14px] text-[#888888]">
          לאחר תשלום מוצלח ההזמנה תאושר אוטומטית.
        </p>
      )}

      {payError && (
        <Alert variant="error">
          {payError}
        </Alert>
      )}

      <FAQBlock
        title="שאלות נפוצות"
        items={PAYMENT_FAQ_ITEMS}
        moreLink={{ href: "/help/faq", label: "כל השאלות והתשובות" }}
      />

      <StickyCTA width="narrow">
        <div className="space-y-3">
          <p className="font-assistant text-[12px] text-[#888888] text-center">
            בלחיצה על תשלום אתם מאשרים את{" "}
            <Link href="/help/terms" className="underline underline-offset-2 hover:text-black">
              תנאי השימוש
            </Link>{" "}
            ,{" "}
            <Link href="/help/faq" className="underline underline-offset-2 hover:text-black">
              מדיניות התמיכה
            </Link>{" "}
            ו{" "}
            <Link href="/help/insurance-terms" className="underline underline-offset-2 hover:text-black">
              תנאי הכיסוי
            </Link>
            .
          </p>
          <Button
            className={PRIMARY_BTN}
            onClick={handlePay}
            disabled={loading || isConfirmed}
          >
            {loading
              ? "מעביר לתשלום..."
              : isConfirmed
                ? "התשלום הושלם"
                : "לתשלום בכרטיס אשראי"}
          </Button>
          <p className="font-assistant text-[12px] text-[#888888] text-center">
            תשלום מאובטח. פיקדון מוחזר בהתאם למדיניות ההחזרה.
          </p>
          <TrustCTARow />
        </div>
      </StickyCTA>
      </PageContainer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
          <PageContainer width="default" className="space-y-4 max-w-2xl">
            <h1 className="page-title">תשלום</h1>
            <div className="rounded-[8px] border border-black/10 bg-white p-4 md:p-6">
              <LoadingBlock message="טוען פרטי הזמנה..." variant="full" />
            </div>
          </PageContainer>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
