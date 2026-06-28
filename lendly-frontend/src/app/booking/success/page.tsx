"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK_BOOKING = {
  title: "מצלמת סוני A7III",
  startDate: "2024-07-10",
  endDate: "2024-07-13",
  days: 3,
  total: 1196,
  ref: "LND-2024-00841",
};

function formatDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}.${month}`;
}

function AnimatedCheck() {
  return (
    <div className="relative h-[120px] w-[120px]">
      <motion.svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          stroke="#1A8C6A"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
        <motion.path
          d="M 34 61 L 51 79 L 86 41"
          stroke="#1A8C6A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
        />
      </motion.svg>
    </div>
  );
}

export default function BookingSuccessPage() {
  useEffect(() => {
    const t = setTimeout(() => {
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.45 },
        colors: ["#1A8C6A", "#4ADE80", "#FCD34D", "#F87171", "#60A5FA", "#C084FC"],
        gravity: 0.9,
        scalar: 1.1,
      });
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <div className="pt-4"><Navbar /></div>
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      {/* Animated checkmark */}
      <AnimatedCheck />

      {/* Heading — Heebo 900 */}
      <motion.h1
        className="mt-6 font-sans text-[34px] font-black leading-tight text-black"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
      >
        ההזמנה אושרה!
      </motion.h1>

      <motion.p
        className="mt-2 max-w-xs font-assistant text-[15px] text-[#666666]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
      >
        אישור נשלח למייל שלך. המשכיר יצור איתך קשר בקרוב.
      </motion.p>

      {/* Booking summary card */}
      <motion.div
        className="mt-8 w-full max-w-sm space-y-2 rounded-[8px] border border-black/10 bg-white p-5 text-right"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-assistant text-[13px] text-[#666666]">פריט</span>
          <span className="font-sans text-[14px] font-black text-black">
            {MOCK_BOOKING.title}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-assistant text-[13px] text-[#666666]">תאריכים</span>
          <span className="font-assistant text-[14px] text-black">
            {formatDate(MOCK_BOOKING.startDate)} – {formatDate(MOCK_BOOKING.endDate)}{" "}
            ({MOCK_BOOKING.days} ימים)
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-black/8 pt-2">
          <span className="font-assistant text-[13px] text-[#666666]">סה"כ</span>
          <span className="font-sans text-[20px] font-black text-black">
            ₪{MOCK_BOOKING.total}
          </span>
        </div>
        <p dir="ltr" className="text-left font-assistant text-[11px] text-[#AAAAAA]">
          {MOCK_BOOKING.ref}
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="mt-6 flex w-full max-w-sm flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <Link
          href="/bookings"
          className="flex items-center justify-center rounded-full bg-[#1A8C6A] py-3.5 font-sans text-[15px] font-black text-white transition-colors duration-200 hover:bg-[#158060]"
        >
          לצ&apos;אט עם המשכיר
        </Link>
        <Link
          href="/bookings"
          className="flex items-center justify-center rounded-full border border-black/15 py-3.5 font-sans text-[14px] font-black text-black transition-colors duration-200 hover:bg-black/5"
        >
          לטיולים שלי
        </Link>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
