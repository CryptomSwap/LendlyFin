"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { isDateInRange } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import ListingAvailabilityLegend from "./ListingAvailabilityLegend";
import BlockDateRangeDialog from "./BlockDateRangeDialog";

type DayState = "available" | "blocked" | "booked";

interface BlockedRange {
  id: string;
  startDate: string;
  endDate: string;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ListingAvailabilityCalendarProps {
  listingId: string;
  onBlockSuccess?: () => void;
  className?: string;
}

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"]; // Sun–Sat short

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function getPaddingDays(year: number, month: number): number {
  const first = new Date(year, month, 1);
  const dayOfWeek = first.getDay();
  return dayOfWeek;
}

export default function ListingAvailabilityCalendar({
  listingId,
  onBlockSuccess,
  className,
}: ListingAvailabilityCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/availability`);
      if (!res.ok) {
        if (res.status === 401) setError("יש להתחבר כדי לצפות בזמינות.");
        else setError("שגיאה בטעינת זמינות");
        return;
      }
      const data = await res.json();
      setBlockedRanges(data.blockedRanges ?? []);
      setBookings(data.bookings ?? []);
    } catch {
      setError("שגיאה בטעינת זמינות");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const getDayState = useCallback(
    (day: Date): DayState => {
      const inBooking = bookings.some((b) =>
        isDateInRange(day, b.startDate, b.endDate)
      );
      if (inBooking) return "booked";
      const inBlocked = blockedRanges.some((r) =>
        isDateInRange(day, r.startDate, r.endDate)
      );
      if (inBlocked) return "blocked";
      return "available";
    },
    [blockedRanges, bookings]
  );

  const handleBlock = useCallback(
    async (startDate: string, endDate: string) => {
      const res = await fetch(`/api/listings/${listingId}/blocked-ranges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "שגיאה בהוספת חסימה");
      await fetchAvailability();
      onBlockSuccess?.();
    },
    [listingId, fetchAvailability, onBlockSuccess]
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  const padding = getPaddingDays(year, month);
  const monthLabel = viewDate.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  if (error) {
    return (
      <div className={cn("rounded-lg border bg-card p-4 text-sm text-destructive", className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ListingAvailabilityLegend />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setDialogOpen(true)}
        >
          <CalendarPlus className="h-4 w-4" />
          חסום תאריכים
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/30">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-muted"
            aria-label="חודש קודם"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="font-medium text-sm" aria-live="polite">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-muted"
            aria-label="חודש הבא"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            טוען...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 text-center text-xs text-muted-foreground border-b border-border">
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i} className="py-1.5 font-medium">
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: padding }, (_, i) => (
                <div key={`pad-${i}`} className="min-h-[36px] sm:min-h-[44px] border-b border-l border-border" />
              ))}
              {days.map((day) => {
                const state = getDayState(day);
                return (
                  <div
                    key={day.toISOString().slice(0, 10)}
                    className={cn(
                      "min-h-[36px] sm:min-h-[44px] flex items-center justify-center border-b border-l border-border text-sm",
                      state === "available" && "bg-muted/30",
                      state === "blocked" && "bg-amber-100 border-amber-200 text-amber-900",
                      state === "booked" && "bg-primary/15 text-primary font-medium"
                    )}
                    title={
                      state === "available"
                        ? "זמין"
                        : state === "blocked"
                          ? "חסום"
                          : "תפוס (הזמנה)"
                    }
                  >
                    {day.getDate()}
                  </div>
                );
              })}
              {Array.from(
                { length: (7 - ((padding + days.length) % 7)) % 7 },
                (_, i) => (
                  <div key={`trail-${i}`} className="min-h-[36px] sm:min-h-[44px] border-b border-l border-border" />
                )
              )}
            </div>
          </>
        )}
      </div>

      <BlockDateRangeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onBlock={handleBlock}
        suggestedMonth={getMonthKey(viewDate)}
      />
    </div>
  );
}
