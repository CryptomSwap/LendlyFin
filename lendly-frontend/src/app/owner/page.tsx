"use client";

import Link from "next/link";
import {
  Package, Clock, CalendarCheck, Car,
  CheckCircle, Banknote, PlusCircle, List,
  Calendar, MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MOCK = {
  ownerName: "יוסי כהן",
  stats: {
    activeListings: 4, pendingRequests: 2, upcomingPickups: 1,
    activeRentals: 1, completedBookings: 23, earningsIls: 8640,
  },
  attentionBookings: [
    { id: "b3", ref: "LND-2024-00912", title: "מקרן Epson",          renter: "נועה מזרחי", status: "REQUESTED", startDate: "2024-07-20" },
    { id: "b1", ref: "LND-2024-00841", title: "מצלמת סוני A7III",   renter: "דנה לוי",    status: "CONFIRMED",  startDate: "2024-07-10" },
  ],
  listings: [
    { id: "l1", title: "מצלמת סוני A7III",   status: "ACTIVE",            pricePerDay: 120, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80" },
    { id: "l2", title: "מקרן Epson Full HD",  status: "ACTIVE",            pricePerDay: 110, image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80" },
    { id: "l3", title: "מיקסר Pioneer DDJ",   status: "PENDING_APPROVAL",  pricePerDay: 150, image: "https://images.unsplash.com/photo-1571266752780-a98b7aec94eb?w=400&q=80" },
    { id: "l4", title: "מקדחה Bosch",          status: "ACTIVE",            pricePerDay: 45,  image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80" },
  ],
};

const LISTING_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE:           { label: "פעיל",           color: "#1A8C6A" },
  PENDING_APPROVAL: { label: "ממתין לאישור",   color: "#F59E0B" },
  PAUSED:           { label: "מושהה",           color: "#888888" },
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  REQUESTED: { label: "ממתין לתשלום", color: "#F59E0B" },
  CONFIRMED: { label: "מאושרת",       color: "#1A8C6A" },
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

const STATS = [
  {
    icon: <Package className="h-5 w-5 text-[#1A8C6A]" />,
    label: "מודעות פעילות",
    value: MOCK.stats.activeListings,
    alert: false,
  },
  {
    icon: <Clock className="h-5 w-5 text-[#1A8C6A]" />,
    label: "בקשות ממתינות",
    value: MOCK.stats.pendingRequests,
    alert: MOCK.stats.pendingRequests > 0,
  },
  {
    icon: <CalendarCheck className="h-5 w-5 text-[#1A8C6A]" />,
    label: "איסופים קרובים",
    value: MOCK.stats.upcomingPickups,
    alert: false,
  },
  {
    icon: <Car className="h-5 w-5 text-[#1A8C6A]" />,
    label: "השכרות פעילות",
    value: MOCK.stats.activeRentals,
    alert: false,
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-[#1A8C6A]" />,
    label: "הזמנות שהושלמו",
    value: MOCK.stats.completedBookings,
    alert: false,
  },
  {
    icon: <Banknote className="h-5 w-5 text-[#1A8C6A]" />,
    label: "הכנסות",
    value: `₪${MOCK.stats.earningsIls.toLocaleString()}`,
    alert: false,
  },
];

const ACTIONS = [
  {
    icon: <PlusCircle className="h-4 w-4 text-[#1A8C6A]" />,
    title: "הוסף מודעה",
    desc: "פרסם פריט חדש",
    href: "/add",
  },
  {
    icon: <List className="h-4 w-4 text-[#1A8C6A]" />,
    title: "המודעות שלי",
    desc: "נהל מודעות",
    href: "/owner/listings",
  },
  {
    icon: <Calendar className="h-4 w-4 text-[#1A8C6A]" />,
    title: "ניהול זמינות",
    desc: "חסום תאריכים",
    href: "/owner/availability",
  },
  {
    icon: <MessageSquare className="h-4 w-4 text-[#1A8C6A]" />,
    title: "הזמנות",
    desc: "צפה בהזמנות",
    href: "/bookings",
  },
];

export default function OwnerDashboardPage() {
  const { stats, attentionBookings, listings } = MOCK;

  return (
    <div dir="rtl" className="min-h-screen bg-white pb-24">
      <div className="pt-4"><Navbar /></div>
      <div className="max-w-[1420px] mx-auto px-5 pt-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="font-sans text-[32px] font-black text-black">לוח מלווה</h1>
          <p className="font-assistant text-[14px] text-[#888888] mt-1">
            {stats.activeListings} מודעות פעילות · {stats.pendingRequests} בקשות ממתינות
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {STATS.map((s, i) => (
            <div key={i} className="rounded-[8px] border border-black/10 bg-white p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-[8px] bg-[#F0FAF6] flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="font-assistant text-[11px] text-[#888888]">{s.label}</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[20px] font-black text-black leading-tight">
                    {s.value}
                  </span>
                  {s.alert && (
                    <span className="rounded-full bg-[#FEF3C7] px-1.5 font-assistant text-[10px] font-bold text-[#D97706]">
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="rounded-[8px] border border-black/10 bg-white p-5">
          <p className="font-sans text-[15px] font-black text-black mb-3">פעולות מהירות</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIONS.map(a => (
              <Link
                key={a.title}
                href={a.href}
                className="rounded-[8px] border border-black/10 bg-white px-4 py-3 flex items-center gap-3 hover:bg-black/[0.02] hover:border-black/20 transition-all duration-200 cursor-pointer"
              >
                <div className="h-8 w-8 rounded-[6px] bg-[#F0FAF6] flex items-center justify-center shrink-0">
                  {a.icon}
                </div>
                <div>
                  <p className="font-sans text-[14px] font-black text-black">{a.title}</p>
                  <p className="font-assistant text-[11px] text-[#888888]">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Needs attention */}
        {attentionBookings.length > 0 && (
          <div>
            <p className="font-sans text-[15px] font-black text-black mb-3">דורש טיפול</p>
            <div className="space-y-2">
              {attentionBookings.map(b => {
                const meta  = BOOKING_STATUS[b.status] ?? { label: b.status, color: "#888888" };
                const rgb   = hexToRgb(meta.color);
                return (
                  <div
                    key={b.id}
                    className="rounded-[8px] border-r-4 border-r-[#F59E0B] border border-black/10 bg-white px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[14px] font-black text-black truncate">{b.title}</p>
                      <p className="font-assistant text-[12px] text-[#888888]">
                        {b.renter} · {b.startDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="rounded-full px-2.5 py-0.5 font-assistant text-[11px] font-bold"
                        style={{ color: meta.color, backgroundColor: `rgba(${rgb}, 0.12)` }}
                      >
                        {meta.label}
                      </span>
                      <Link
                        href={`/bookings/${b.id}`}
                        className="font-assistant text-[12px] text-[#1A8C6A] font-semibold hover:underline cursor-pointer"
                      >
                        צפה
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My listings */}
        <div>
          <p className="font-sans text-[20px] font-black text-black mb-4">המודעות שלי</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map(l => {
              const meta = LISTING_STATUS[l.status] ?? { label: l.status, color: "#888888" };
              const rgb  = hexToRgb(meta.color);
              return (
                <div
                  key={l.id}
                  className="rounded-[8px] border border-black/10 bg-white overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={l.image}
                      alt={l.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <span
                      className="rounded-full px-2 py-0.5 font-assistant text-[10px] font-bold mb-1 inline-block"
                      style={{ color: meta.color, backgroundColor: `rgba(${rgb}, 0.12)` }}
                    >
                      {meta.label}
                    </span>
                    <p className="font-sans text-[14px] font-black text-black leading-snug">
                      {l.title}
                    </p>
                    <p className="font-assistant text-[12px] text-[#888888]">
                      ₪{l.pricePerDay} / יום
                    </p>
                    <Link
                      href={`/owner/listings/${l.id}`}
                      className="font-assistant text-[12px] text-[#1A8C6A] font-semibold hover:underline mt-2 block"
                    >
                      ניהול זמינות
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
