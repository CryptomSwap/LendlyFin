"use client";

import Link from "next/link";
import { LayoutDashboard, CalendarDays, HelpCircle, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK_USER = {
  name: "יוסי כהן",
  kycStatus: "APPROVED" as KycStatus,
  completedBookings: 23,
  reviewsCount: 18,
  averageRating: 4.9,
};

type KycStatus = "APPROVED" | "SUBMITTED" | "PENDING" | "REJECTED";

const KYC_META: Record<KycStatus, { label: string; color: string; bg: string }> = {
  APPROVED:  { label: "מאומת ✓",       color: "#1A8C6A", bg: "#F0FAF6" },
  SUBMITTED: { label: "נשלח לאימות",  color: "#F59E0B", bg: "#FFFBEB" },
  PENDING:   { label: "ממתין לאימות", color: "#888888", bg: "#F5F5F5" },
  REJECTED:  { label: "נדחה",          color: "#EF4444", bg: "#FEF2F2" },
};

const NAV_CARDS = [
  {
    icon: <LayoutDashboard className="h-5 w-5 text-[#1A8C6A]" />,
    title: "לוח מלווה – מודעות והזמנות",
    desc: "מודעות, בקשות והזמנות פעילות",
    href: "/owner",
  },
  {
    icon: <CalendarDays className="h-5 w-5 text-[#1A8C6A]" />,
    title: "ההזמנות שלי",
    desc: "השכרות פעילות ועברות",
    href: "/bookings",
  },
  {
    icon: <HelpCircle className="h-5 w-5 text-[#1A8C6A]" />,
    title: "מרכז עזרה",
    desc: "שאלות נפוצות ותמיכה",
    href: "/help",
  },
];

export default function ProfilePage() {
  const user = MOCK_USER;
  const kyc  = KYC_META[user.kycStatus];
  const initial = user.name.charAt(0);

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-lg mx-auto px-5 pt-8 space-y-4">

        {/* Avatar + name */}
        <div className="text-center mb-2">
          <div className="h-20 w-20 rounded-full bg-[#F0FAF6] flex items-center justify-center mx-auto font-sans text-[32px] font-black text-[#1A8C6A]">
            {initial}
          </div>
          <p className="font-sans text-[24px] font-black text-black mt-3">
            {user.name}
          </p>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 font-assistant text-[12px] font-bold mt-1"
            style={{ color: kyc.color, backgroundColor: kyc.bg }}
          >
            {kyc.label}
          </span>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[8px] border border-black/10 bg-white p-4 text-center">
            <p className="font-sans text-[22px] font-black text-black">{user.completedBookings}</p>
            <p className="font-assistant text-[11px] text-[#888888]">הזמנות</p>
          </div>
          <div className="rounded-[8px] border border-black/10 bg-white p-4 text-center">
            <p className="font-sans text-[22px] font-black text-black">
              {user.averageRating}{" "}
              <span className="text-[#1A8C6A]">★</span>
            </p>
            <p className="font-assistant text-[11px] text-[#888888]">דירוג</p>
          </div>
          <div className="rounded-[8px] border border-black/10 bg-white p-4 text-center">
            <p className="font-sans text-[22px] font-black text-black">{user.reviewsCount}</p>
            <p className="font-assistant text-[11px] text-[#888888]">ביקורות</p>
          </div>
        </div>

        {/* Action cards */}
        <div className="space-y-3">
          {NAV_CARDS.map(card => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[8px] border border-black/10 bg-white p-4 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[8px] bg-[#F0FAF6] flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <div>
                  <p className="font-sans text-[15px] font-black text-black">{card.title}</p>
                  <p className="font-assistant text-[12px] text-[#888888]">{card.desc}</p>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-[#AAAAAA] shrink-0" />
            </Link>
          ))}
        </div>

        {/* Identity verification card */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5">
          <p className="font-sans text-[15px] font-black text-black mb-3">אימות זהות</p>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 font-assistant text-[12px] font-bold"
              style={{ color: kyc.color, backgroundColor: kyc.bg }}
            >
              {kyc.label}
            </span>
          </div>
          {user.kycStatus === "APPROVED" ? (
            <p className="font-assistant text-[13px] text-[#888888]">
              מאומת מסייע לרוכשים לבטוח במודעות שלך
            </p>
          ) : (
            <Link
              href="/profile/kyc"
              className="mt-3 inline-flex rounded-full bg-[#1A8C6A] px-6 py-2.5 font-sans text-[14px] font-black text-white hover:bg-[#157A5A] transition-colors duration-200"
            >
              התחל אימות
            </Link>
          )}
        </div>

        {/* Sign out */}
        <button
          type="button"
          className="mt-2 w-full rounded-full border border-black/15 bg-white px-6 py-3 font-sans text-[15px] font-black text-black hover:bg-black/5 transition-colors duration-200 text-center"
        >
          התנתקות
        </button>

      </div>
      <Footer />
    </div>
  );
}
