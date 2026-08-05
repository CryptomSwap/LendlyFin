import { headers } from "next/headers";
import Link from "next/link";
import { LayoutDashboard, Shield, Settings, ChevronLeft } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";
import DeleteAccountButton from "@/components/delete-account-button";
import ThemeToggle from "@/components/theme-toggle";
import { PageContainer, SurfaceCard } from "@/components/layout";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import { VERIFICATION_REASSURANCE } from "@/lib/copy/help-reassurance";

export const runtime = "nodejs";

type Me = {
  user?: {
    id: string;
    name: string;
    kycStatus?: string | null;
    kycRejectedReason?: string | null;
    phoneNumber?: string | null;
    isAdmin?: boolean;
    completedBookingsCount?: number;
    reviewsCount?: number;
    averageRating?: number;
  };
  id?: string;
  name?: string;
  kycStatus?: string | null;
  kycRejectedReason?: string | null;
  phoneNumber?: string | null;
  isAdmin?: boolean;
  completedBookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
};

async function getMe(): Promise<Me | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  const url = `${proto}://${host}/api/me`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProfilePage() {
  const meData = await getMe();

  if (!meData) {
    return (
      <div className="min-h-screen pb-6 md:pb-10 w-full bg-white" dir="rtl">
        <PageContainer width="narrow" className="pt-8 space-y-6">
          <h1 className="font-sans text-[28px] font-black tracking-[-1px] text-black md:text-[36px]">
            פרופיל
          </h1>
          <SurfaceCard>
            <p className="font-sans text-[15px] font-bold text-black mb-3">מראה</p>
            <ThemeToggle />
          </SurfaceCard>
          <p className="font-assistant text-[14px] text-[#888888]">
            לא נמצא משתמש במערכת (הרץ seed).
          </p>
        </PageContainer>
      </div>
    );
  }

  // Handle both response formats (user object or flat)
  const me = meData.user || meData;
  const kycStatus = me.kycStatus || "PENDING";
  const initial = (me.name || "?").charAt(0);
  const completedBookings = me.completedBookingsCount ?? 0;
  const reviewsCount = me.reviewsCount ?? 0;
  const averageRating = me.averageRating ?? 0;

  return (
    <div className="min-h-screen pb-6 md:pb-10 w-full bg-white" dir="rtl">
      <PageContainer width="narrow" className="pt-8 space-y-4">
        {/* Avatar + name */}
        <div className="text-center mb-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F0FAF6] font-sans text-[32px] font-black text-[#1A8C6A]">
            {initial}
          </div>
          <p className="mt-3 font-sans text-[24px] font-black text-black">{me.name}</p>
          {!me.isAdmin && (
            <div className="mt-2">
              <RedesignStatusPill variant={statusPillVariant(kycStatus)}>
                {statusLabel(kycStatus)}
              </RedesignStatusPill>
            </div>
          )}
        </div>

        {/* Trust stats */}
        {(completedBookings > 0 || reviewsCount > 0 || averageRating > 0) && (
          <div className="grid grid-cols-3 gap-3">
            <SurfaceCard padding="sm" className="text-center">
              <p className="font-sans text-[22px] font-black text-black">{completedBookings}</p>
              <p className="font-assistant text-[11px] text-[#888888]">הזמנות</p>
            </SurfaceCard>
            <SurfaceCard padding="sm" className="text-center">
              <p className="font-sans text-[22px] font-black text-black">
                {averageRating > 0 ? averageRating.toFixed(1) : "—"}{" "}
                {averageRating > 0 && <span className="text-[#1A8C6A]">★</span>}
              </p>
              <p className="font-assistant text-[11px] text-[#888888]">דירוג</p>
            </SurfaceCard>
            <SurfaceCard padding="sm" className="text-center">
              <p className="font-sans text-[22px] font-black text-black">{reviewsCount}</p>
              <p className="font-assistant text-[11px] text-[#888888]">ביקורות</p>
            </SurfaceCard>
          </div>
        )}

        {/* Owner dashboard link */}
        <Link
          href="/owner"
          className="flex items-center justify-between rounded-[8px] border border-black/10 bg-white p-4 transition-colors duration-200 hover:bg-black/[0.02]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#F0FAF6]">
              <LayoutDashboard className="h-5 w-5 text-[#1A8C6A]" />
            </div>
            <div>
              <p className="font-sans text-[15px] font-black text-black">לוח מלווה</p>
              <p className="font-assistant text-[12px] text-[#888888]">
                מודעות, בקשות והזמנות פעילות
              </p>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 shrink-0 text-[#AAAAAA]" />
        </Link>

        {/* Appearance */}
        <SurfaceCard>
          <p className="mb-3 font-sans text-[15px] font-black text-black">מראה</p>
          <ThemeToggle />
        </SurfaceCard>

        {/* KYC */}
        {!me.isAdmin && (
          <SurfaceCard>
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#1A8C6A]" />
              <p className="font-sans text-[15px] font-black text-black">אימות זהות</p>
            </div>
            <div className="mb-3">
              <RedesignStatusPill variant={statusPillVariant(kycStatus)}>
                {statusLabel(kycStatus)}
              </RedesignStatusPill>
            </div>

            {(kycStatus === "PENDING" || kycStatus === "IN_PROGRESS") && (
              <>
                <p className="mb-4 font-assistant text-[13px] text-[#888888]">
                  אימות זהות נדרש ליצירת הזמנות. נעבור יחד צעד-אחר-צעד בסלפי ותעודה מזהה.
                </p>
                <Link
                  href="/profile/kyc"
                  className="inline-flex rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-bold text-white shadow-[0_6px_24px_rgba(26,140,106,0.35)] transition-colors duration-200 hover:bg-[#157A5A]"
                >
                  התחל אימות
                </Link>
              </>
            )}

            {kycStatus === "SUBMITTED" && (
              <p className="font-assistant text-[13px] text-[#888888]">
                הבקשה שלך נשלחה לאימות. נבדוק אותה ונעדכן אותך בקרוב.
              </p>
            )}

            {kycStatus === "APPROVED" && (
              <p className="font-assistant text-[13px] text-[#888888]">
                אימות הזהות שלך אושר בהצלחה. מאומת מסייע לרוכשים לבטוח במודעות שלך.
              </p>
            )}

            {me.kycRejectedReason && (
              <p className="mt-2 font-assistant text-[13px] text-red-500">
                סיבת דחייה: {me.kycRejectedReason}
              </p>
            )}

            <p className="mt-4 border-t border-black/10 pt-3 font-assistant text-[12px] text-[#888888]">
              {VERIFICATION_REASSURANCE.short}{" "}
              <Link
                href={VERIFICATION_REASSURANCE.learnMoreHref}
                className="font-sans font-bold text-[#1A8C6A] hover:underline"
              >
                {VERIFICATION_REASSURANCE.learnMoreLabel}
              </Link>
            </p>
          </SurfaceCard>
        )}

        {/* Admin */}
        {me.isAdmin && (
          <SurfaceCard className="space-y-2">
            <p className="mb-3 font-sans text-[15px] font-black text-black">ניהול</p>
            <Link
              href="/admin/metrics"
              className="flex w-full items-center justify-center rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
            >
              מדדים
            </Link>
            <Link
              href="/admin/users"
              className="flex w-full items-center justify-center rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
            >
              משתמשים
            </Link>
            <Link
              href="/admin/kyc"
              className="flex w-full items-center justify-center rounded-full border border-black/15 bg-white px-6 py-2.5 font-sans text-[14px] font-bold text-black transition-colors hover:bg-black/5"
            >
              ביקורת אימות זהות
            </Link>
          </SurfaceCard>
        )}

        {/* Settings + account actions */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 font-sans text-[15px] font-bold text-black opacity-50"
          >
            <Settings className="h-4 w-4" />
            הגדרות (בקרוב)
          </button>
          <SignOutButton />
          <DeleteAccountButton />
        </div>
      </PageContainer>
    </div>
  );
}

function statusLabel(s: string) {
  if (s === "APPROVED") return "מאומת ✓";
  if (s === "REJECTED") return "נדחה";
  if (s === "SUBMITTED") return "נשלח לאימות";
  if (s === "IN_PROGRESS") return "בתהליך";
  return "ממתין לאימות";
}

function statusPillVariant(
  s: string
): "success" | "warning" | "danger" | "muted" | "brand" {
  if (s === "APPROVED") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "SUBMITTED" || s === "IN_PROGRESS") return "warning";
  return "muted";
}
