"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { FAQBlock } from "@/components/ui/faq-block";
import { LoadingBlock } from "@/components/ui/loading-block";
import { PageContainer } from "@/components/layout";
import { formatMoneyIls } from "@/lib/pricing";
import { PAYMENT_FAQ_ITEMS } from "@/lib/copy/help-reassurance";
import { Copy, Check, ChevronDown } from "lucide-react";

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
};

function fmt(d: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPaidReassurance, setShowPaidReassurance] = useState(false);

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

    if (data.paymentLink) {
      window.location.href = data.paymentLink;
      return;
    }

    setPayError("קישור התשלום לא זמין. נא ליצור קשר.");
  }

  if (!bookingId) {
    return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-4">
        <Alert variant="default">חסר פרטי הזמנה. יש לגשת מהזמנה או מהקישור שנשלח.</Alert>
      </PageContainer>
    </div>
    );
  }
  if (!summary) {
    return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-4">
        <h1 className="page-title">תשלום</h1>
        <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
          <LoadingBlock message="טוען פרטי הזמנה..." variant="full" />
        </div>
      </PageContainer>
    </div>
    );
  }

  const totalNow = summary.totalDue ?? summary.rentalSubtotal + summary.depositAmount + (summary.serviceFee ?? 0);
  const ref = summary.bookingRef ?? "";

  async function handleCopyRef() {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen w-full app-page-bg pb-24" dir="rtl">
      <PageContainer width="narrow" className="space-y-6">
      <h1 className="page-title">תשלום</h1>

      {/* What to do — clear steps */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">מה לעשות עכשיו</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p className="flex gap-2">
            <span className="font-semibold text-foreground shrink-0">1.</span>
            ציינו את מספר ההזמנה (למטה) בעת התשלום ב-Bit.
          </p>
          <p className="flex gap-2">
            <span className="font-semibold text-foreground shrink-0">2.</span>
            לחצו &quot;לתשלום ב-Bit&quot; ובצעו את התשלום.
          </p>
          <p className="flex gap-2">
            <span className="font-semibold text-foreground shrink-0">3.</span>
            אחרי התשלום הצוות מאמת ומאשר — תקבלו עדכון כשההזמנה אושרה.
          </p>
        </CardContent>
      </Card>

      {/* Booking reference — prominent + copy */}
      {ref && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">מספר הזמנה (לציין ב-Bit)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <p className="font-mono text-lg font-bold text-foreground" dir="ltr">
                {ref}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyRef}
                className="shrink-0 gap-1"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "הועתק" : "העתק"}
              </Button>
            </div>
            <p className="text-muted-foreground">
              ציינו את המספר בתשלום ב-Bit או בפנייה לתמיכה.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">סיכום הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">{summary.title}</p>
          <p>
            {fmt(summary.startDate)} → {fmt(summary.endDate)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">פירוט תשלום</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">השכרה: {formatMoneyIls(summary.rentalSubtotal)}</p>
          {typeof summary.serviceFee === "number" && summary.serviceFee > 0 && (
            <p className="text-muted-foreground">עמלת פלטפורמה: {formatMoneyIls(summary.serviceFee)}</p>
          )}
          <p className="text-muted-foreground">פיקדון (מוחזר): {formatMoneyIls(summary.depositAmount)}</p>
          <hr className="border-border" />
          <p className="font-semibold text-foreground text-base">
            סה״כ לתשלום עכשיו: {formatMoneyIls(totalNow)}
          </p>
        </CardContent>
      </Card>

      {summary.paymentStatus === "PENDING" && (
        <p className="text-sm text-muted-foreground">
          אחרי התשלום הצוות מאמת ומאשר. עקבו אחר הסטטוס בדף ההזמנה.
        </p>
      )}

      {/* "I've paid" — frontend-only reassurance */}
      {summary.paymentStatus === "PENDING" && (
        <Card>
          <CardContent className="pt-4">
            {!showPaidReassurance ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPaidReassurance(true)}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
                כבר שילמתי
              </Button>
            ) : (
              <div className="text-sm space-y-2 rounded-lg bg-muted/50 p-3">
                <p className="font-medium text-foreground">התשלום התקבל</p>
                <p className="text-muted-foreground">
                  הצוות יאמת ויאשר. עקבו אחר הסטטוס בדף ההזמנה.
                </p>
                <Link
                  href={`/bookings/${summary.bookingId}`}
                  className="inline-flex font-medium text-primary hover:underline"
                >
                  צפו בסטטוס ההזמנה
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
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
          <p className="text-xs text-muted-foreground text-center">
            בלחיצה על תשלום אתם מאשרים את{" "}
            <Link href="/help/terms" className="underline underline-offset-2 hover:text-foreground">
              תנאי השימוש
            </Link>{" "}
            ,{" "}
            <Link href="/help/faq" className="underline underline-offset-2 hover:text-foreground">
              מדיניות התמיכה
            </Link>{" "}
            ו{" "}
            <Link href="/help/insurance-terms" className="underline underline-offset-2 hover:text-foreground">
              תנאי הכיסוי
            </Link>
            .
          </p>
          <Button className="w-full" onClick={handlePay} disabled={loading}>
            {loading ? "מעביר לתשלום..." : "לתשלום ב-Bit"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            אחרי אימות — ההזמנה מאושרת. פיקדון מוחזר בהתאם למצב הפריט.
          </p>
          <TrustCTARow />
        </div>
      </StickyCTA>
      </PageContainer>
    </div>
  );
}
