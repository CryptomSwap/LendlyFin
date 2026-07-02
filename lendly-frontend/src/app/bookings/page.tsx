"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK_BOOKINGS = [
  { id: "b1", ref: "LND-2024-00841", title: "מצלמת סוני A7III", status: "CONFIRMED", startDate: "2024-07-10", endDate: "2024-07-13", pricePerDay: 120, totalDue: 1196, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80" },
  { id: "b2", ref: "LND-2024-00790", title: "מקדחה מקצועית Bosch", status: "COMPLETED", startDate: "2024-06-01", endDate: "2024-06-03", pricePerDay: 45, totalDue: 390, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80" },
  { id: "b3", ref: "LND-2024-00912", title: "מקרן Epson Full HD", status: "REQUESTED", startDate: "2024-07-20", endDate: "2024-07-22", pricePerDay: 110, totalDue: 970, image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80" },
  { id: "b4", ref: "LND-2024-00755", title: "אוהל קמפינג ל-4", status: "CANCELLED_BY_RENTER", startDate: "2024-05-15", endDate: "2024-05-18", pricePerDay: 80, totalDue: 640, image: "https://images.unsplash.com/photo-1504280390368-3971d53b4f93?w=400&q=80" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  REQUESTED:           { label: "ממתין לאישור",       color: "#F59E0B" },
  CONFIRMED:           { label: "אושרה",              color: "#1A8C6A" },
  ACTIVE:              { label: "פעילה",               color: "#1A8C6A" },
  RETURNED:            { label: "הוחזר",               color: "#888888" },
  COMPLETED:           { label: "הושלמה",              color: "#888888" },
  CANCELLED_BY_RENTER: { label: "בוטלה · השוכר",       color: "#EF4444" },
  CANCELLED_BY_OWNER:  { label: "בוטלה · המשכיר",     color: "#EF4444" },
  IN_DISPUTE:          { label: "במחלוקת",             color: "#EF4444" },
};

const ACTIVE_STATUSES  = new Set(["REQUESTED", "CONFIRMED", "ACTIVE", "RETURNED"]);
const DONE_STATUSES    = new Set(["COMPLETED"]);
const CANCEL_STATUSES  = new Set(["CANCELLED_BY_RENTER", "CANCELLED_BY_OWNER"]);

type Tab = "הכל" | "פעילות" | "הושלמו" | "בוטלו";
const TABS: Tab[] = ["הכל", "פעילות", "הושלמו", "בוטלו"];

function filterByTab(tab: Tab) {
  if (tab === "הכל")    return MOCK_BOOKINGS;
  if (tab === "פעילות") return MOCK_BOOKINGS.filter(b => ACTIVE_STATUSES.has(b.status));
  if (tab === "הושלמו") return MOCK_BOOKINGS.filter(b => DONE_STATUSES.has(b.status));
  if (tab === "בוטלו")  return MOCK_BOOKINGS.filter(b => CANCEL_STATUSES.has(b.status));
  return MOCK_BOOKINGS;
}

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) => {
    const [, m, d] = iso.split("-");
    return `${parseInt(d)} ב${MONTH_HE[parseInt(m) - 1]}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

const MONTH_HE = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("הכל");
  const filtered = filterByTab(activeTab);

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-[1420px] mx-auto px-5 pt-8 pb-16">

        {/* Heading */}
        <h1 className="font-sans text-[32px] font-black text-black mb-6">
          הזמנות
        </h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b border-black/10">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "pb-3 font-assistant text-[14px] font-semibold text-black border-b-2 border-black -mb-px"
                  : "pb-3 font-assistant text-[14px] font-semibold text-[#666666] border-b-2 border-transparent -mb-px"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards list */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(booking => {
              const meta = STATUS_META[booking.status] ?? { label: booking.status, color: "#888888" };
              const rgb = hexToRgb(meta.color);
              return (
                <div
                  key={booking.id}
                  className="rounded-[8px] border border-black/10 bg-white flex gap-0 overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-200 cursor-pointer"
                >
                  {/* Image strip */}
                  <div className="shrink-0 w-[120px] h-[100px]">
                    <img
                      src={booking.image}
                      alt={booking.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {/* Top row: title + badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans text-[15px] font-black text-black line-clamp-1">
                        {booking.title}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 font-assistant text-[11px] font-bold shrink-0"
                        style={{
                          color: meta.color,
                          backgroundColor: `rgba(${rgb}, 0.15)`,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Middle: dates + ref */}
                    <p className="font-assistant text-[13px] text-[#666666]">
                      {formatDateRange(booking.startDate, booking.endDate)}
                      <span className="mx-1.5">·</span>
                      <span dir="ltr" className="inline">{booking.ref}</span>
                    </p>

                    {/* Bottom row: total */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans text-[16px] font-black text-black">
                        ₪{booking.totalDue}
                      </span>
                      <span className="font-assistant text-[12px] text-[#666666]">
                        סה״כ שולם
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="font-sans text-[18px] font-black text-black">
              אין הזמנות בסטטוס זה
            </p>
            <p className="font-assistant text-[14px] text-[#666666]">
              נסה לבחור סטטוס אחר או הצג את כל ההזמנות.
            </p>
            <Button variant="primary" size="md" asChild>
              <a href="/search">חפשו השכרות</a>
            </Button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
