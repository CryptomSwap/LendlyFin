"use client";

import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/status-labels";

export type BookingFilterType =
  | "all"
  | "REQUESTED"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "DISPUTE";

const FILTER_LABELS: Record<BookingFilterType, string> = {
  all: "הכל",
  REQUESTED: BOOKING_STATUS_LABELS.REQUESTED,
  CONFIRMED: "אושרה",
  ACTIVE: "פעילה",
  COMPLETED: "הושלמה",
  DISPUTE: "מחלוקת",
};

export interface BookingStatusTabsProps {
  activeFilter: BookingFilterType;
  onFilterChange: (filter: BookingFilterType) => void;
  counts: Record<BookingFilterType, number>;
}

export function BookingStatusTabs({
  activeFilter,
  onFilterChange,
  counts,
}: BookingStatusTabsProps) {
  const filters: BookingFilterType[] = [
    "all",
    "REQUESTED",
    "CONFIRMED",
    "ACTIVE",
    "COMPLETED",
    "DISPUTE",
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
      dir="rtl"
      role="tablist"
      aria-label="סינון הזמנות לפי סטטוס"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        const count = counts[filter] ?? 0;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
            )}
          >
            {FILTER_LABELS[filter]}
            {count > 0 && (
              <span
                className={cn("mr-0.5 text-[10px]", isActive ? "opacity-90" : "opacity-70")}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
