"use client";

import { useMemo, useState } from "react";
import BookingCard from "@/components/booking-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingStatusTabs, type BookingFilterType } from "./BookingStatusTabs";
import { Inbox } from "lucide-react";

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

function fmt(d: string) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function computeCounts(bookings: Booking[]): Record<BookingFilterType, number> {
  const all = bookings.length;
  const REQUESTED = bookings.filter((b) => b.status === "REQUESTED").length;
  const CONFIRMED = bookings.filter((b) => b.status === "CONFIRMED").length;
  const ACTIVE = bookings.filter((b) => b.status === "ACTIVE").length;
  const RETURNED = bookings.filter((b) => b.status === "RETURNED").length;
  const IN_DISPUTE = bookings.filter((b) => b.status === "IN_DISPUTE").length;
  const NON_RETURN_PENDING = bookings.filter((b) => b.status === "NON_RETURN_PENDING").length;
  const NON_RETURN_CONFIRMED = bookings.filter((b) => b.status === "NON_RETURN_CONFIRMED").length;
  const COMPLETED = bookings.filter((b) => b.status === "COMPLETED").length;
  return {
    all,
    REQUESTED,
    CONFIRMED,
    ACTIVE,
    RETURNED,
    IN_DISPUTE,
    NON_RETURN_PENDING,
    NON_RETURN_CONFIRMED,
    COMPLETED,
  };
}

export interface BookingsListSectionProps {
  bookings: Booking[];
}

export function BookingsListSection({ bookings }: BookingsListSectionProps) {
  const [activeFilter, setActiveFilter] = useState<BookingFilterType>("all");

  const counts = useMemo(() => computeCounts(bookings), [bookings]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  return (
    <div className="space-y-4" dir="rtl">
      <BookingStatusTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />
      {filtered.length === 0 ? (
        activeFilter === "all" ? null : (
          <EmptyState
            icon={<Inbox className="h-12 w-12 text-muted-foreground" aria-hidden />}
            title="אין הזמנות בסטטוס זה"
            subtitle="נסה לבחור סטטוס אחר או הצג את כל ההזמנות."
            ctaLabel="הצג את כל ההזמנות"
            onCtaClick={() => setActiveFilter("all")}
          />
        )
      ) : (
        <section className="space-y-2" aria-label="רשימת הזמנות">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              title={b.listing.title}
              subtitle={`${fmt(b.startDate)} → ${fmt(b.endDate)}`}
              status={b.status}
              href={`/bookings/${b.id}`}
              bookingRef={b.bookingRef}
            />
          ))}
        </section>
      )}
    </div>
  );
}
