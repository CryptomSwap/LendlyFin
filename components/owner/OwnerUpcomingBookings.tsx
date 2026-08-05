import Link from "next/link";
import type { UpcomingItem } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { Calendar, RotateCcw } from "lucide-react";

export interface OwnerUpcomingBookingsProps {
  upcomingPickups: UpcomingItem[];
  upcomingReturns: UpcomingItem[];
  className?: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ItemList({
  items,
  emptyMessage,
  title,
  icon: Icon,
}: {
  items: UpcomingItem[];
  emptyMessage: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="mb-1 flex items-center gap-1 font-sans text-[14px] font-bold text-black">
          <Icon className="h-4 w-4 text-[#1A8C6A]" />
          {title}
        </p>
        <p className="font-assistant text-[13px] text-[#888888]">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 flex items-center gap-1 font-sans text-[14px] font-bold text-black">
        <Icon className="h-4 w-4 text-[#1A8C6A]" />
        {title}
      </p>
      <ul className="space-y-3">
        {items.map((b) => (
          <li key={b.id}>
            <Link
              href={`/bookings/${b.id}`}
              className="block rounded-[8px] border border-black/10 bg-white p-3 transition-colors hover:bg-black/[0.02] md:p-4"
            >
              <p className="font-sans text-[14px] font-bold text-black">{b.listingTitle}</p>
              <p className="font-assistant text-[12px] text-[#888888]">
                {b.renterName} · {fmt(b.startDate)}
                {b.bookingRef && (
                  <span className="mr-1 font-mono" dir="ltr">
                    {" "}
                    {b.bookingRef}
                  </span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OwnerUpcomingBookings({
  upcomingPickups,
  upcomingReturns,
  className,
}: OwnerUpcomingBookingsProps) {
  return (
    <div
      className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
      dir="rtl"
    >
      <h2 className="mb-4 font-sans text-[16px] font-black text-black">
        איסופים והחזרות קרובים
      </h2>
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <ItemList
          items={upcomingPickups}
          emptyMessage="אין איסופים מתוכננים"
          title="איסופים קרובים"
          icon={Calendar}
        />
        <ItemList
          items={upcomingReturns}
          emptyMessage="אין החזרות מתוכננות"
          title="החזרות קרובות"
          icon={RotateCcw}
        />
      </div>
    </div>
  );
}
