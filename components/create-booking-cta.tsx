"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StickyCTA from "@/components/ui/sticky-cta";
import { TrustCTARow } from "@/components/ui/trust-cta-row";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type KYCStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED" | null;

export default function CreateBookingCTA({ listingId }: { listingId: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(null);
  const [kycRejectedReason, setKycRejectedReason] = useState<string | null>(null);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorMessage = data?.error ?? "שגיאה ביצירת הזמנה";
      alert(errorMessage);
      // Refresh KYC status if it was a KYC-related error
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

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-sm text-foreground">
          התחלה
          <input
            className="input-base mt-1"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={!canBook}
          />
        </label>

        <label className="text-sm text-foreground">
          סיום
          <input
            className="input-base mt-1"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!canBook}
          />
        </label>
      </div>

      <StickyCTA width="narrow">
        <div className="space-y-3">
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleContinue}
            disabled={loading || !canBook}
          >
            {loading ? "יוצר הזמנה..." : "המשך לתשלום"}
          </Button>
          <TrustCTARow />
        </div>
      </StickyCTA>
    </>
  );
}
