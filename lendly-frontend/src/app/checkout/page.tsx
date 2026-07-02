"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK = {
  title: "מצלמת סוני A7III",
  startDate: "2024-07-10",
  endDate: "2024-07-13",
  days: 3,
  pricePerDay: 120,
  rentalSubtotal: 360,
  deposit: 800,
  serviceFee: 36,
  total: 1196,
  bookingRef: "LND-2024-00841",
};

const STEPS = [
  "ציינו את מספר ההזמנה (למטה) בעת התשלום ב-Bit.",
  "לחצו \"לתשלום ב-Bit\" ובצעו את התשלום.",
  "אחרי התשלום הצוות מאמת ומאשר — תקבלו עדכון כשההזמנה אושרה.",
];

function formatDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}.${month}`;
}

export default function CheckoutPage() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(MOCK.bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-lg mx-auto px-5 pt-8 space-y-4">

        {/* Back */}
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 font-assistant text-[13px] text-[#666666] hover:text-black transition-colors mb-4 group">
          <ChevronRight className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          חזרה
        </button>

        {/* Heading */}
        <h1 className="font-sans text-[28px] font-black text-black">תשלום</h1>

        {/* Steps card */}
        <div className="rounded-[8px] border-r-4 border-r-[#1A8C6A] border border-black/10 bg-white p-5 space-y-2">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-sans font-bold text-black shrink-0">
                {i + 1}.
              </span>
              <span className="font-assistant text-[14px] text-[#666666]">
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Booking ref card */}
        <div className="rounded-[12px] bg-black text-white p-6 text-center space-y-3">
          <p className="font-assistant text-[13px] text-white/60">מספר הזמנה (לציין ב-Bit)</p>
          <p dir="ltr" className="font-sans text-[36px] font-black text-white tracking-widest">
            {MOCK.bookingRef}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-white/10 border border-white/20 px-4 py-2 font-assistant text-[13px] text-white hover:bg-white/20 transition-colors duration-200"
          >
            {copied ? "הועתק" : "העתק"}
          </button>
        </div>

        {/* Order summary card */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 space-y-2">
          {/* Item + dates */}
          <div className="font-assistant text-[14px] text-black">
            <span className="font-bold">{MOCK.title}</span>
            <span className="text-[#666666] mr-2">
              {formatDate(MOCK.startDate)}–{formatDate(MOCK.endDate)} ({MOCK.days} ימים)
            </span>
          </div>

          <div className="border-t border-black/8 my-1" />

          {/* Line items */}
          <div className="flex justify-between font-assistant text-[13px] text-[#666666]">
            <span>השכרה ({MOCK.days} × ₪{MOCK.pricePerDay})</span>
            <span>₪{MOCK.rentalSubtotal}</span>
          </div>
          <div className="flex justify-between font-assistant text-[13px] text-[#666666]">
            <span>עמלת פלטפורמה</span>
            <span>₪{MOCK.serviceFee}</span>
          </div>
          <div className="rounded-[8px] bg-[#F0FAF6] border border-[#1A8C6A]/15 px-3 py-2 flex items-center justify-between">
            <span className="font-assistant text-[13px] text-[#1A8C6A] font-semibold">פיקדון מוחזר: ₪{MOCK.deposit}</span>
            <Link href="/help/faq" className="font-assistant text-[11px] text-[#1A8C6A] hover:underline">(מה זה?)</Link>
          </div>

          <div className="border-t border-black/10 my-1" />

          {/* Total */}
          <div className="flex justify-between font-sans text-[20px] font-black text-black">
            <span>סה״כ לתשלום עכשיו</span>
            <span>₪{MOCK.total}</span>
          </div>
        </div>

      </div>
      <Footer />

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-5 py-4 space-y-2">
        <p className="font-assistant text-[11px] text-[#AAAAAA] text-center">
          בלחיצה על תשלום אתם מאשרים את{" "}
          <Link href="/help/terms" className="underline">תנאי השימוש</Link>
          ,{" "}
          <Link href="/help/faq" className="underline">מדיניות התמיכה</Link>
          {" "}ו{" "}
          <Link href="/help/insurance-terms" className="underline">תנאי הכיסוי</Link>
        </p>
        <Button variant="primary" size="lg" className="w-full">
          לתשלום ב-Bit
        </Button>
      </div>
    </div>
  );
}
