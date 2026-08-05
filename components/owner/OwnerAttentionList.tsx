import Link from "next/link";
import { RedesignStatusPill } from "@/components/redesign/status-pill";
import { getBookingStatusLabel } from "@/lib/status-labels";
import type { AttentionBooking } from "@/lib/owner/dashboard";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface OwnerAttentionListProps {
  bookings: AttentionBooking[];
  className?: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OwnerAttentionList({
  bookings,
  className,
}: OwnerAttentionListProps) {
  if (bookings.length === 0) {
    return (
      <div
        className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
        dir="rtl"
      >
        <h2 className="mb-3 flex items-center gap-2 font-sans text-[16px] font-black text-black">
          <AlertCircle className="h-4 w-4 text-[#888888]" />
          דורש טיפול
        </h2>
        <p className="font-assistant text-[14px] text-[#888888]">
          אין הזמנות שדורשות טיפול כרגע.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-[8px] border border-black/10 bg-white p-5", className)}
      id="attention"
      dir="rtl"
    >
      <h2 className="mb-3 flex items-center gap-2 font-sans text-[16px] font-black text-black">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        דורש טיפול ({bookings.length})
      </h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <Link
            key={b.id}
            href={`/bookings/${b.id}`}
            className="block rounded-[8px] border border-black/10 bg-white p-3 transition-colors hover:bg-black/[0.02] md:p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-sans text-[14px] font-bold text-black">{b.listingTitle}</p>
              <RedesignStatusPill variant="warning">
                {getBookingStatusLabel(b.status)}
              </RedesignStatusPill>
            </div>
            <p className="mt-1 font-assistant text-[13px] text-[#888888]">{b.renterName}</p>
            <p className="mt-0.5 font-assistant text-[12px] text-[#888888]">
              {fmt(b.startDate)} – {fmt(b.endDate)}
              {b.bookingRef && (
                <span className="mr-1 font-mono" dir="ltr">
                  {" "}
                  {b.bookingRef}
                </span>
              )}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
