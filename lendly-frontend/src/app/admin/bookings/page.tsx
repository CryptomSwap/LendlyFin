"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK_BOOKINGS = [
  { id: "b1", ref: "LND-2024-00841", listingTitle: "מצלמת סוני A7III",  userName: "דנה לוי",       status: "CONFIRMED",          createdAt: "2024-07-01", pickupDone: true  },
  { id: "b2", ref: "LND-2024-00790", listingTitle: "מקדחה Bosch",        userName: "אבי כהן",       status: "COMPLETED",          createdAt: "2024-06-15", pickupDone: true  },
  { id: "b3", ref: "LND-2024-00912", listingTitle: "מקרן Epson",         userName: "נועה מזרחי",    status: "REQUESTED",          createdAt: "2024-07-08", pickupDone: false },
  { id: "b4", ref: "LND-2024-00755", listingTitle: "אוהל קמפינג",        userName: "רועי שמש",      status: "IN_DISPUTE",         createdAt: "2024-06-20", pickupDone: true  },
  { id: "b5", ref: "LND-2024-00699", listingTitle: "גיטרה Yamaha",       userName: "מיכל בן דוד",  status: "CANCELLED_BY_RENTER", createdAt: "2024-06-05", pickupDone: false },
];

const STATUS_LABEL: Record<string, string> = {
  REQUESTED:           "ממתין לתשלום",
  CONFIRMED:           "מאושרת",
  ACTIVE:              "פעילה",
  COMPLETED:           "הושלמה",
  CANCELLED_BY_RENTER: "בוטלה",
  IN_DISPUTE:          "במחלוקת",
};

const STATUS_COLOR: Record<string, string> = {
  REQUESTED:           "#F59E0B",
  CONFIRMED:           "#1A8C6A",
  ACTIVE:              "#1A8C6A",
  COMPLETED:           "#888888",
  CANCELLED_BY_RENTER: "#EF4444",
  IN_DISPUTE:          "#EF4444",
};

const NAV = [
  { label: "מדדים",    href: "/admin/metrics",   active: false },
  { label: "הזמנות",  href: "/admin/bookings",   active: true  },
  { label: "מודעות",  href: "/admin/listings",   active: false },
  { label: "משתמשים", href: "/admin/users",       active: false },
  { label: "מחלוקות", href: "/admin/disputes",    active: false },
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${parseInt(d)}.${parseInt(m)}`;
}

export default function AdminBookingsPage() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("ALL");

  const filtered = MOCK_BOOKINGS.filter(b => {
    const matchSearch =
      !search ||
      b.listingTitle.includes(search) ||
      b.userName.includes(search) ||
      b.ref.includes(search);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-[1420px] mx-auto px-5 pt-8 space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-sans text-[32px] font-black text-black">לוח בקרה</h1>
          <nav className="flex gap-2 flex-wrap">
            {NAV.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? "rounded-full border border-black px-4 py-1.5 font-assistant text-[13px] font-semibold bg-black text-white"
                    : "rounded-full border border-black/15 px-4 py-1.5 font-assistant text-[13px] font-semibold text-black hover:bg-black/5 transition-colors duration-200"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, מודעה, מספר הזמנה..."
            className="rounded-[8px] border border-black/15 px-4 py-2.5 font-assistant text-[14px] outline-none focus:border-[#1A8C6A] flex-1 transition-colors duration-150"
          />
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            className="rounded-[8px] border border-black/15 bg-white px-3 py-2.5 font-assistant text-[13px] outline-none cursor-pointer"
          >
            <option value="ALL">כל הסטטוסים</option>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Table card */}
        <div className="rounded-[8px] border border-black/10 bg-white overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] bg-[#FAFAFA] border-b border-black/[0.08] px-5 py-3">
            {["מודעה", "שוכר", "סטטוס", "תאריך", ""].map(col => (
              <span key={col} className="font-sans text-[11px] font-black text-[#888888] uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center font-assistant text-[14px] text-[#888888]">
              לא נמצאו הזמנות
            </div>
          ) : (
            filtered.map(b => {
              const color = STATUS_COLOR[b.status] ?? "#888888";
              const rgb   = hexToRgb(color);
              return (
                <div
                  key={b.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] px-5 py-4 border-b border-black/[0.06] last:border-0 hover:bg-black/[0.02] transition-colors duration-150 items-center"
                >
                  {/* מודעה */}
                  <div className="min-w-0">
                    <p className="font-sans text-[14px] font-black text-black truncate">
                      {b.listingTitle}
                    </p>
                    <p dir="ltr" className="font-assistant text-[12px] text-[#888888]">
                      {b.ref}
                    </p>
                  </div>

                  {/* שוכר */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-assistant text-[13px] text-black">{b.userName}</span>
                    {b.pickupDone && (
                      <span className="rounded-full bg-[#F0FAF6] px-2 py-0.5 font-assistant text-[10px] font-bold text-[#1A8C6A] shrink-0">
                        ✔ איסוף
                      </span>
                    )}
                  </div>

                  {/* סטטוס */}
                  <div>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-assistant text-[11px] font-bold"
                      style={{
                        color,
                        backgroundColor: `rgba(${rgb}, 0.12)`,
                      }}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>

                  {/* תאריך */}
                  <span className="font-assistant text-[12px] text-[#888888]">
                    {formatDate(b.createdAt)}
                  </span>

                  {/* צפה */}
                  <span className="font-assistant text-[12px] text-[#1A8C6A] font-semibold hover:underline cursor-pointer">
                    צפה
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
