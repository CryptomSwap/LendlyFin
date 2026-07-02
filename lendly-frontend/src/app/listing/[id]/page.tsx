"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusPill from "@/components/ui/StatusPill";

const MOCK_LISTING = {
  id: "1",
  title: "מצלמת סוני A7III",
  category: "צילום וידאו",
  location: "תל אביב",
  pricePerDay: 120,
  deposit: 800,
  description:
    "מצלמה מקצועית מצוינת לצילום וידאו ותמונות. כוללת סוללה נוספת ומטען.",
  pickupNote:
    'איסוף עצמי בלבד — פלורנטין, תל אביב. זמין בסופ"ש.',
  rules: "אין לצלם במים. יש להחזיר עם אותו מטען.",
  rating: 4.9,
  reviewsCount: 76,
  images: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  ],
  owner: { name: "יוסי כהן", completedRentals: 23 },
};

const THUMBNAILS = [
  MOCK_LISTING.images[0],
  MOCK_LISTING.images[1],
  MOCK_LISTING.images[0],
  MOCK_LISTING.images[1],
];

function InfoSection({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-4 rounded-[8px] border border-black/10 bg-white p-5">
      <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-wide text-black">
        {label}
      </h2>
      <p className="font-assistant text-[14px] leading-relaxed text-[#666666]">
        {body}
      </p>
    </div>
  );
}

export default function ListingPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const mainImage = THUMBNAILS[activeImage] ?? MOCK_LISTING.images[0];
  const ownerInitial = MOCK_LISTING.owner.name.charAt(0);

  return (
    <div className="min-h-screen bg-white pb-24" dir="rtl">
      <div className="pt-4">
        <Navbar />
      </div>

      <div className="mx-auto max-w-[1420px] px-5 pt-8">
        <button onClick={() => window.history.back()} className="flex items-center gap-1.5 font-assistant text-[13px] text-[#666666] hover:text-black transition-colors mb-4 group">
          <ChevronRight className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          חזרה
        </button>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-[8px]">
              <img
                src={mainImage}
                alt={MOCK_LISTING.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {THUMBNAILS.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={[
                    "h-16 cursor-pointer overflow-hidden rounded-[8px] border-2 object-cover",
                    activeImage === index
                      ? "border-[#1A8C6A]"
                      : "border-transparent",
                  ].join(" ")}
                  aria-label={`תמונה ${index + 1}`}
                  aria-pressed={activeImage === index}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 rounded-[8px] border border-black/10 bg-white p-6">
              <StatusPill variant="brand">פעיל</StatusPill>

              <h1 className="font-sans text-[28px] font-black leading-tight text-black">
                {MOCK_LISTING.title}
              </h1>

              <p className="font-assistant text-[13px] text-[#666666]">
                {MOCK_LISTING.category} · {MOCK_LISTING.location}
              </p>

              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[14px] font-bold text-[#1A8C6A]">
                  ★
                </span>
                <span className="font-sans text-[14px] font-bold text-[#1A8C6A]">
                  {MOCK_LISTING.rating.toFixed(1)}
                </span>
                <span className="font-assistant text-[13px] text-[#1A8C6A]">
                  ({MOCK_LISTING.reviewsCount} ביקורות)
                </span>
              </div>
            </div>

            <InfoSection label="תיאור" body={MOCK_LISTING.description} />
            <InfoSection label="איסוף וזמינות" body={MOCK_LISTING.pickupNote} />
            <InfoSection label="כללים" body={MOCK_LISTING.rules} />

            <div className="mt-4 flex items-center gap-4 rounded-[8px] border border-black/10 bg-white p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0FAF6] font-sans text-[18px] font-black text-[#1A8C6A]">
                {ownerInitial}
              </div>
              <div>
                <p className="font-sans text-[13px] font-bold text-black mb-0.5">המלווה</p>
                <p className="font-sans text-[15px] font-black text-black">
                  {MOCK_LISTING.owner.name}
                </p>
                <p className="font-assistant text-[12px] text-[#666666]">
                  {MOCK_LISTING.reviewsCount > 0
                    ? `${MOCK_LISTING.rating.toFixed(1)} · ${MOCK_LISTING.reviewsCount} ביקורות · ${MOCK_LISTING.owner.completedRentals} השכרות הושלמו`
                    : MOCK_LISTING.owner.completedRentals > 0
                    ? `${MOCK_LISTING.owner.completedRentals} השכרות הושלמו`
                    : "אין ביקורות עדיין"}
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-[12px] border border-black/10 bg-white p-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-[42px] font-black leading-none text-black">
                  ₪{MOCK_LISTING.pricePerDay}
                </span>
                <span className="font-assistant text-[16px] text-[#666666]">
                  ליום
                </span>
              </div>

              <div className="rounded-[8px] bg-[#F0FAF6] border border-[#1A8C6A]/15 px-3 py-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-assistant text-[13px] text-[#1A8C6A] font-semibold">פיקדון מוחזר: ₪{MOCK_LISTING.deposit}</span>
                  <Link href="/help/faq" className="font-assistant text-[11px] text-[#1A8C6A] hover:underline">(מה זה?)</Link>
                </div>
                <p className="font-assistant text-[11px] text-[#666666]">
                  הפיקדון יוחזר בסיום ההשכרה אם הפריט מוחזר תקין
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="התחלה"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <Input
                  label="סיום"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <Button variant="primary" size="lg" className="w-full">
                המשך לתשלום
              </Button>

              <p className="text-center font-assistant text-[11px] text-[#AAAAAA]">
                בחירת תאריכים אינה מחייבת — התשלום רק אחרי יצירת ההזמנה.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
