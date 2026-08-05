import { headers } from "next/headers";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingsListSection } from "@/components/bookings/BookingsListSection";
import { PageContainer, PageIntro } from "@/components/layout";
import { CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

type Booking = {
  id: string;
  status:
    | "REQUESTED"
    | "CONFIRMED"
    | "ACTIVE"
    | "RETURNED"
    | "IN_DISPUTE"
    | "NON_RETURN_PENDING"
    | "NON_RETURN_CONFIRMED"
    | "COMPLETED"
    | "DISPUTE";
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
  const cookie = h.get("cookie") ?? "";

  const res = await fetch(url, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (res.status === 401) {
    redirect("/signin?callbackUrl=/bookings");
  }
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
      <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
        <PageContainer width="default" className="space-y-6 pt-6">
          <PageIntro title="הזמנות" />
          <EmptyState
            icon={<CalendarDays className="h-12 w-12 text-[#1A8C6A]" aria-hidden />}
            title="אין הזמנות עדיין"
            subtitle="ההזמנות שלכם יופיעו כאן. גלו ציוד להשכרה והזמינו."
            ctaLabel="חפשו השכרות"
            ctaHref="/search"
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white pb-24" dir="rtl">
      <PageContainer width="default" className="space-y-6 pt-6">
        <PageIntro title="הזמנות" />
        <BookingsListSection bookings={bookings} />
      </PageContainer>
    </div>
  );
}
