"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ACTIVE"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED_BY_RENTER"
  | "CANCELLED_BY_OWNER"
  | "IN_DISPUTE";

const MOCK_BOOKING = {
  id: "b1",
  ref: "LND-2024-00841",
  title: "מצלמת סוני A7III",
  image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  status: "CONFIRMED" as BookingStatus,
  startDate: "2024-07-10",
  endDate: "2024-07-13",
  rentalSubtotal: 360,
  serviceFee: 36,
  deposit: 800,
  totalDue: 1196,
  paymentStatus: "PAID",
  pickupNote: "פלורנטין, תל אביב. זמין בסוף שבוע.",
  ownerName: "יוסי כהן",
};

const LIFECYCLE_STEPS = ["בקשה", "אישור", "פעילה", "הוחזר", "הושלמה"];
const STEP_INDEX: Record<BookingStatus, number> = {
  REQUESTED: 0,
  CONFIRMED: 1,
  ACTIVE: 2,
  RETURNED: 3,
  COMPLETED: 4,
  CANCELLED_BY_RENTER: -1,
  CANCELLED_BY_OWNER: -1,
  IN_DISPUTE: 3,
};

const STATUS_META: Record<BookingStatus, { label: string; color: string }> = {
  REQUESTED:           { label: "ממתין לתשלום",       color: "#F59E0B" },
  CONFIRMED:           { label: "מאושרת",              color: "#1A8C6A" },
  ACTIVE:              { label: "פעילה",               color: "#1A8C6A" },
  RETURNED:            { label: "הוחזר",               color: "#888888" },
  COMPLETED:           { label: "הושלמה",              color: "#888888" },
  CANCELLED_BY_RENTER: { label: "בוטלה",               color: "#EF4444" },
  CANCELLED_BY_OWNER:  { label: 'בוטלה ע"י המשכיר',   color: "#EF4444" },
  IN_DISPUTE:          { label: "במחלוקת",             color: "#EF4444" },
};

const MONTH_HE = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${parseInt(d)} ב${MONTH_HE[parseInt(m) - 1]}`;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/* ── Lifecycle Progress ─────────────────────────────────────── */
function LifecycleCard({ status }: { status: BookingStatus }) {
  const isCancelled = STEP_INDEX[status] === -1;
  const current = STEP_INDEX[status];

  return (
    <div className="rounded-[8px] border border-black/10 bg-white p-5">
      <p className="font-sans text-[13px] font-bold text-black uppercase tracking-wide mb-4">
        ציר זמן
      </p>

      {isCancelled ? (
        <div className="rounded-[8px] bg-[#FEF2F2] border border-red-200 px-4 py-3 font-assistant text-[13px] text-red-600 font-semibold">
          ההזמנה בוטלה
        </div>
      ) : (
        <>
          {/* Dots + connectors */}
          <div className="flex items-center gap-0 w-full">
            {LIFECYCLE_STEPS.map((_, i) => {
              const done    = i < current;
              const active  = i === current;
              const circleClass = done
                ? "bg-[#1A8C6A] text-white"
                : active
                ? "bg-black text-white"
                : "border-2 border-black/15 bg-white text-[#CCCCCC]";

              return (
                <div key={i} className="flex items-center" style={{ flex: i < LIFECYCLE_STEPS.length - 1 ? "1" : "0 0 auto" }}>
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-sans text-[12px] font-black ${circleClass}`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  {i < LIFECYCLE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] ${i < current ? "bg-[#1A8C6A]" : "bg-black/10"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2">
            {LIFECYCLE_STEPS.map((label, i) => (
              <span
                key={i}
                className={`font-assistant text-[11px] ${
                  i === current ? "text-black font-bold" : "text-[#AAAAAA]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Action Card ────────────────────────────────────────────── */
function ActionCard({ status }: { status: BookingStatus }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");

  if (status === "REQUESTED") {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-5">
        <a
          href={`/checkout?bookingId=${MOCK_BOOKING.id}`}
          className="block w-full rounded-full font-sans text-[15px] font-black py-3.5 bg-[#1A8C6A] text-white hover:bg-[#158060] transition-colors duration-200 text-center"
        >
          לתשלום
        </a>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-5 space-y-2">
        <button
          type="button"
          className="w-full rounded-full font-sans text-[15px] font-black py-3.5 border border-black/15 bg-white text-black hover:bg-black/5 transition-colors duration-200"
        >
          רשימת איסוף
        </button>
        <p className="font-assistant text-[12px] text-[#666666] text-center">
          יש להשלים רשימת איסוף לפני קבלת הפריט
        </p>
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-5">
        <button
          type="button"
          className="w-full rounded-full font-sans text-[15px] font-black py-3.5 border border-black/15 bg-white text-black hover:bg-black/5 transition-colors duration-200"
        >
          רשימת החזרה
        </button>
      </div>
    );
  }

  if (status === "RETURNED") {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-5">
        <button
          type="button"
          className="w-full rounded-full font-sans text-[15px] font-black py-3.5 border border-black/15 bg-white text-black hover:bg-black/5 transition-colors duration-200"
        >
          פתח מחלוקת (48 שעות)
        </button>
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-5 space-y-4">
        <p className="font-sans text-[14px] font-bold text-black">כתוב ביקורת</p>

        {/* Stars */}
        <div className="flex gap-1 justify-center" dir="ltr">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="text-[28px] leading-none transition-transform duration-100 hover:scale-110"
            >
              <span style={{ color: n <= (hovered || stars) ? "#F59E0B" : "#DDDDDD" }}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="שתפו את החוויה שלכם..."
          rows={3}
          className="w-full rounded-[8px] border border-black/10 px-3 py-2.5 font-assistant text-[13px] text-black placeholder:text-[#AAAAAA] resize-none focus:outline-none focus:border-[#1A8C6A]"
        />

        <button
          type="button"
          disabled={!stars}
          className="w-full rounded-full font-sans text-[15px] font-black py-3.5 bg-[#1A8C6A] text-white hover:bg-[#158060] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
        >
          שלח ביקורת
        </button>
      </div>
    );
  }

  return null;
}

/* ── Primary CTA label for sticky bar ──────────────────────── */
function primaryCtaLabel(status: BookingStatus): string | null {
  switch (status) {
    case "REQUESTED":  return "לתשלום";
    case "CONFIRMED":  return "רשימת איסוף";
    case "ACTIVE":     return "רשימת החזרה";
    case "RETURNED":   return "פתח מחלוקת (48 שעות)";
    case "COMPLETED":  return "שלח ביקורת";
    default:           return null;
  }
}

/* ── Page ───────────────────────────────────────────────────── */
export default function BookingDetailPage() {
  const b = MOCK_BOOKING;
  const meta = STATUS_META[b.status];
  const rgb = hexToRgb(meta.color);
  const ctaLabel = primaryCtaLabel(b.status);

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-2xl mx-auto px-5 pt-8 space-y-4">

        {/* Back link */}
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 font-assistant text-[13px] text-[#666666] hover:text-black transition-colors mb-4 group">
          <ChevronRight className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          חזרה
        </button>

        {/* Heading */}
        <h1 className="font-sans text-[28px] font-black text-black">
          סטטוס הזמנה
        </h1>

        {/* Lifecycle */}
        <LifecycleCard status={b.status} />

        {/* Details card */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5 space-y-3">
          {/* Status badge */}
          <span
            className="inline-flex rounded-full px-3 py-1 font-assistant text-[12px] font-bold"
            style={{
              color: meta.color,
              backgroundColor: `rgba(${rgb}, 0.15)`,
            }}
          >
            {meta.label}
          </span>

          {/* Image */}
          <img
            src={b.image}
            alt={b.title}
            className="w-full h-[180px] object-cover rounded-[8px]"
          />

          {/* Title */}
          <p className="font-sans text-[16px] font-black text-black">{b.title}</p>

          {/* Ref */}
          <p dir="ltr" className="font-assistant text-[12px] text-[#666666]">
            {b.ref}
          </p>

          {/* Dates */}
          <p className="font-assistant text-[13px] text-[#666666]">
            {formatDate(b.startDate)} – {formatDate(b.endDate)}
          </p>

          {/* Pickup note */}
          <p className="font-assistant text-[12px] text-[#666666] border-t border-black/[0.08] pt-3 mt-3">
            📍 {b.pickupNote}
          </p>
        </div>

        {/* Payment card */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5">
          <p className="font-sans text-[13px] font-bold text-black mb-3">
            פירוט תשלום
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between font-assistant text-[13px] text-[#666666]">
              <span>השכרה</span>
              <span>₪{b.rentalSubtotal}</span>
            </div>
            <div className="flex justify-between font-assistant text-[13px] text-[#666666]">
              <span>עמלת פלטפורמה</span>
              <span>₪{b.serviceFee}</span>
            </div>
            <div className="flex justify-between font-assistant text-[13px] text-[#666666]">
              <span>פיקדון (מוחזר)</span>
              <span>₪{b.deposit}</span>
            </div>
          </div>

          <div className="flex justify-between font-sans text-[17px] font-black text-black border-t border-black/[0.08] pt-3 mt-2">
            <span>סה"כ</span>
            <span>₪{b.totalDue}</span>
          </div>
        </div>

        {/* Action card */}
        <ActionCard status={b.status} />

        {/* Messages button */}
        <button
          type="button"
          className="w-full rounded-[8px] border border-black/15 bg-white px-4 py-3 font-assistant text-[14px] font-semibold text-black flex items-center justify-center gap-2 hover:bg-black/5 transition-colors duration-200"
        >
          <MessageCircle size={16} />
          הודעות עם המשכיר
        </button>

      </div>
      <Footer />

      {/* Sticky bottom bar */}
      {ctaLabel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-5 py-4">
          <button
            type="button"
            className="w-full rounded-full font-sans text-[15px] font-black py-3.5 bg-[#1A8C6A] text-white hover:bg-[#158060] transition-colors duration-200"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
}
