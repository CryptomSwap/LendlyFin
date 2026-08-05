"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type KYCStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED" | null;

interface UnavailableRange {
  start: string;
  end: string;
}

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isInRanges(dateStr: string, ranges: UnavailableRange[]): boolean {
  return ranges.some((r) => dateStr >= r.start && dateStr <= r.end);
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function hasOverlapWithUnavailable(start: string, end: string, ranges: UnavailableRange[]): boolean {
  return ranges.some((r) => start <= r.end && end >= r.start);
}

export default function CreateBookingCTA({ listingId }: { listingId: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(null);
  const [kycRejectedReason, setKycRejectedReason] = useState<string | null>(null);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unavailable, setUnavailable] = useState<UnavailableRange[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const todayStr = toDateStr(new Date());

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          setIsLoggedIn(!!user?.id);
          setKycStatus(user.kycStatus || "PENDING");
          setKycRejectedReason(user.kycRejectedReason || null);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Failed to check KYC status:", err);
        setIsLoggedIn(false);
      } finally {
        setCheckingKyc(false);
      }
    };
    checkKYC();
  }, []);

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/calendar`);
      if (res.ok) {
        const data = await res.json();
        setUnavailable(data.unavailable ?? []);
      }
    } catch {
      /* availability display is best-effort */
    }
  }, [listingId]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  function handleDayClick(dateStr: string) {
    if (!selectingEnd) {
      setStartDate(dateStr);
      setEndDate("");
      setSelectingEnd(true);
    } else {
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate("");
        return;
      }
      if (hasOverlapWithUnavailable(startDate, dateStr, unavailable)) {
        alert("הטווח שנבחר כולל תאריכים לא זמינים. נסו לבחור תאריכים אחרים.");
        return;
      }
      setEndDate(dateStr);
      setSelectingEnd(false);
    }
  }

  async function handleContinue() {
    if (!startDate || !endDate) {
      alert("בחר תאריכים");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const errorMessage = data?.error ?? "שגיאה ביצירת הזמנה";
      alert(errorMessage);
      if (res.status === 403 && data?.kycStatus) {
        setKycStatus(data.kycStatus);
        setKycRejectedReason(data.kycRejectedReason || null);
      }
      return;
    }

    router.push(`/checkout?bookingId=${data.bookingId}`);
  }

  const isKycApproved = kycStatus === "APPROVED";
  const canBook = isKycApproved && !checkingKyc;

  // Unauthenticated: clear sign-in CTA so user can return to this listing after login
  if (!checkingKyc && !isLoggedIn) {
    const signInUrl = `/signin?callbackUrl=${encodeURIComponent(pathname ?? `/listing/${listingId}`)}`;
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center space-y-3">
          <p className="text-sm text-foreground font-medium">
            התחברו כדי לבחור תאריכים ולהזמין
          </p>
          <p className="text-xs text-muted-foreground">
            המשך עם Google ואז תוכלו להשלים את ההזמנה כאן.
          </p>
        </div>
        <StickyCTA width="narrow">
          <Button variant="gradient" className="w-full" asChild>
            <Link href={signInUrl}>המשך עם Google</Link>
          </Button>
        </StickyCTA>
      </div>
    );
  }

  // Show KYC blocking message if logged in but not approved
  if (!checkingKyc && !isKycApproved) {
    const isRejected = kycStatus === "REJECTED";
    
    return (
      <div className="space-y-4">
        <div className={`${isRejected ? "bg-destructive/10 border-destructive/30" : "bg-primary/5 border-primary/20"} border rounded-lg p-4 space-y-3`}>
          <div className="flex items-start gap-2">
            <span className={`text-xl ${isRejected ? "text-destructive" : "text-primary"}`}>{isRejected ? "!" : "i"}</span>
            <div className="flex-1 space-y-2">
              <h3 className={`font-semibold ${isRejected ? "text-destructive" : "text-foreground"}`}>
                {isRejected ? "אימות זהות נדחה" : "נדרש אימות זהות"}
              </h3>
              {kycStatus === "PENDING" || kycStatus === "IN_PROGRESS" ? (
                <p className="text-sm text-muted-foreground">
                  להשלמת הזמנה נדרש אימות זהות. השלימו את התהליך וחזרו.
                </p>
              ) : kycStatus === "SUBMITTED" ? (
                <p className="text-sm text-muted-foreground">
                  אימות הזהות בבדיקה. לאחר האישור תוכלו ליצור הזמנה.
                </p>
              ) : kycStatus === "REJECTED" ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">
                    אימות הזהות נדחה.
                  </p>
                  {kycRejectedReason && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      <strong>סיבת דחייה:</strong> {kycRejectedReason}
                    </p>
                  )}
                  <p className="text-sm text-destructive">
                    אם נראה שזו טעות,{" "}
                    <a 
                      href="mailto:landlysupport@gmail.com?subject=פנייה בנושא אימות זהות&body=היי, אני ניסיתי לבצע אימות זהות ללנדלי אך ללא הצלחה, אשמח לסיוע."
                      className="underline font-medium hover:text-destructive/80"
                    >
                      פנו לתמיכה
                    </a>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {kycStatus === "PENDING" && (
          <StickyCTA width="narrow">
            <Button variant="gradient" className="w-full" asChild>
              <Link href="/profile/kyc">התחל אימות זהות</Link>
            </Button>
          </StickyCTA>
        )}
      </div>
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  const paddingDays = new Date(year, month, 1).getDay();
  const monthLabel = viewDate.toLocaleDateString("he-IL", { month: "long", year: "numeric" });

  return (
    <>
      {/* Selected dates summary */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className={cn(
          "rounded-lg border p-2.5 text-center transition-colors",
          selectingEnd && !startDate ? "border-primary bg-primary/5" : "border-border"
        )}>
          <span className="text-muted-foreground text-xs block">התחלה</span>
          <span className="font-medium">{startDate || "—"}</span>
        </div>
        <div className={cn(
          "rounded-lg border p-2.5 text-center transition-colors",
          selectingEnd && startDate ? "border-primary bg-primary/5" : "border-border"
        )}>
          <span className="text-muted-foreground text-xs block">סיום</span>
          <span className="font-medium">{endDate || "—"}</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/30">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30"
            aria-label="חודש קודם"
            disabled={year === new Date().getFullYear() && month <= new Date().getMonth()}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="font-medium text-sm">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-muted"
            aria-label="חודש הבא"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground border-b border-border">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="py-1.5 font-medium">{label}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: paddingDays }, (_, i) => (
            <div key={`pad-${i}`} className="min-h-[40px] border-b border-l border-border" />
          ))}
          {days.map((day) => {
            const dateStr = toDateStr(day);
            const isPast = dateStr < todayStr;
            const isUnavail = isInRanges(dateStr, unavailable);
            const disabled = isPast || isUnavail || !canBook;
            const isStart = dateStr === startDate;
            const isEnd = dateStr === endDate;
            const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
            const isBeforeStart = selectingEnd && startDate && dateStr < startDate;

            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled || !!isBeforeStart}
                onClick={() => handleDayClick(dateStr)}
                className={cn(
                  "min-h-[40px] flex items-center justify-center border-b border-l border-border text-sm transition-colors",
                  isPast && "text-muted-foreground/40 bg-muted/20 cursor-not-allowed",
                  isUnavail && !isPast && "bg-red-50 text-red-300 line-through cursor-not-allowed",
                  !disabled && !isBeforeStart && !isStart && !isEnd && !inRange && "hover:bg-primary/10 cursor-pointer bg-muted/5",
                  (isStart || isEnd) && "bg-primary text-primary-foreground font-semibold",
                  inRange && "bg-primary/15 text-primary",
                  isBeforeStart && !isPast && !isUnavail && "text-muted-foreground/40 cursor-not-allowed"
                )}
                title={
                  isPast ? "עבר" : isUnavail ? "לא זמין" : "זמין"
                }
              >
                {day.getDate()}
              </button>
            );
          })}
          {Array.from(
            { length: (7 - ((paddingDays + days.length) % 7)) % 7 },
            (_, i) => (
              <div key={`trail-${i}`} className="min-h-[40px] border-b border-l border-border" />
            )
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-border bg-muted/5" />
          <span>זמין</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-red-50 border border-red-200" />
          <span>לא זמין</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-primary" />
          <span>נבחר</span>
        </div>
      </div>

      {selectingEnd && startDate && (
        <p className="text-xs text-primary text-center">בחרו תאריך סיום</p>
      )}

      <StickyCTA width="narrow">
        <div className="space-y-3">
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleContinue}
            disabled={loading || !canBook || !startDate || !endDate}
          >
            {loading ? "יוצר הזמנה..." : "המשך לתשלום"}
          </Button>
          <TrustCTARow />
        </div>
      </StickyCTA>
    </>
  );
}
