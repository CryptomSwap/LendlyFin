"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star } from "lucide-react";
import Link from "next/link";

export interface QuickViewListing {
  id: string;
  title: string;
  category: string;
  location: string;
  pricePerDay: number;
  deposit: number;
  rating: number;
  reviews: number;
  image: string;
}

const MONTH_HE = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

const MOCK_UNAVAILABLE = new Set([3, 7, 8, 14, 21, 22]);

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun

  return (
    <div>
      <p className="mb-2 font-assistant text-[12px] text-[#666666]">
        {MONTH_HE[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5" dir="rtl">
        {["א","ב","ג","ד","ה","ו","ש"].map((d) => (
          <div key={d} className="pb-1 text-center font-assistant text-[10px] text-[#AAAAAA]">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const past = day < today.getDate();
          const busy = MOCK_UNAVAILABLE.has(day);
          const disabled = past || busy;
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full font-assistant text-[11px] transition-colors",
                disabled
                  ? "cursor-not-allowed text-[#CCCCCC]"
                  : "cursor-pointer text-black hover:bg-[#F0FAF6] hover:text-[#1A8C6A]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface QuickViewDrawerProps {
  listing: QuickViewListing | null;
  onClose: () => void;
}

export default function QuickViewDrawer({ listing, onClose }: QuickViewDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {listing && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qv-backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer — RTL: slides in from left */}
          <motion.div
            key="qv-drawer"
            dir="rtl"
            className="fixed left-0 top-0 z-50 flex h-full w-[480px] flex-col bg-white"
            style={{ borderRight: "1px solid rgba(0,0,0,0.10)" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-black/5"
                aria-label="סגור"
              >
                <X size={18} />
              </button>
              <p className="font-assistant text-[12px] text-[#AAAAAA]">תצוגה מהירה</p>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 font-assistant text-[11px] font-bold text-white backdrop-blur-sm">
                  {listing.category}
                </span>
              </div>

              <div className="space-y-5 px-6 py-5">
                {/* Title + meta */}
                <div>
                  <h2 className="font-sans text-[22px] font-black leading-tight text-black">
                    {listing.title}
                  </h2>
                  <div className="mt-1.5 flex items-center gap-2">
                    <MapPin size={13} className="text-[#666666]" />
                    <span className="font-assistant text-[13px] text-[#666666]">
                      {listing.location}
                    </span>
                    <span className="text-[#CCCCCC]">·</span>
                    <Star size={12} className="fill-[#1A8C6A] text-[#1A8C6A]" />
                    <span className="font-sans text-[13px] font-bold text-black">
                      {listing.rating.toFixed(1)}
                    </span>
                    <span className="font-assistant text-[12px] text-[#666666]">
                      ({listing.reviews})
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sans text-[40px] font-black leading-none text-black">
                    ₪{listing.pricePerDay}
                  </span>
                  <span className="font-assistant text-[15px] text-[#666666]">/ יום</span>
                </div>

                {/* Mini calendar */}
                <div className="rounded-[8px] border border-black/10 bg-white p-4">
                  <p className="mb-3 font-sans text-[13px] font-black text-black">
                    בחר תאריכים
                  </p>
                  <MiniCalendar />
                </div>

                {/* Deposit note */}
                <div className="flex items-center justify-between rounded-[8px] border border-[#1A8C6A]/15 bg-[#F0FAF6] px-4 py-2.5">
                  <span className="font-assistant text-[12px] font-semibold text-[#1A8C6A]">
                    פיקדון מוחזר: ₪{listing.deposit}
                  </span>
                  <Link
                    href="/help/faq"
                    className="font-assistant text-[11px] text-[#1A8C6A] hover:underline"
                  >
                    (מה זה?)
                  </Link>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 border-t border-black/8 px-6 py-4">
              <Link
                href={`/listing/${listing.id}`}
                className="flex w-full items-center justify-center rounded-full bg-[#1A8C6A] py-3.5 font-sans text-[15px] font-black text-white transition-colors duration-200 hover:bg-[#158060]"
              >
                להשכרה
              </Link>
              <Link
                href={`/listing/${listing.id}`}
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-full border border-black/15 py-3.5 font-sans text-[14px] font-black text-black transition-colors duration-200 hover:bg-black/5"
              >
                לעמוד המוצר
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
