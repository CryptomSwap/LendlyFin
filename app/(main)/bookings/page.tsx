import { headers } from "next/headers";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingsListSection } from "@/components/bookings/BookingsListSection";
import { CalendarDays } from "lucide-react";

export const runtime = "nodejs";

type Booking = {
  id: string;
  status: "REQUESTED" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "DISPUTE";
  startDate: string;
  endDate: string;
  listing: { title: string };
  bookingRef?: string | null;
};

async function getBookings(): Promise<Booking[]> {
  const h = await headers();
  const host = h.get("host");
  if (!host) throw new Error("Missing host header");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/bookings`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load bookings: ${res.status} ${text}`);
  }
  return res.json();
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  if (bookings.length === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="section-title">הזמנות</h1>
        <EmptyState
          icon={<CalendarDays className="h-12 w-12 text-primary" aria-hidden />}
          title="אין הזמנות עדיין"
          subtitle="ההזמנות שלכם יופיעו כאן. גלו ציוד להשכרה והזמינו."
          ctaLabel="חפשו השכרות"
          ctaHref="/search"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="section-title">הזמנות</h1>
      <BookingsListSection bookings={bookings} />
    </div>
  );
}

