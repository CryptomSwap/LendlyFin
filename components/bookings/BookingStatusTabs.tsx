"use client";

import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/status-labels";

export type BookingFilterType =
  | "all"
  | "REQUESTED"
  | "CONFIRMED"
  | "ACTIVE"
  | "RETURNED"
  | "COMPLETED"
  | "IN_DISPUTE"
  | "NON_RETURN_PENDING"
  | "NON_RETURN_CONFIRMED";

const FILTER_LABELS: Record<BookingFilterType, string> = {
  all: "הכל",
  REQUESTED: BOOKING_STATUS_LABELS.REQUESTED,
  CONFIRMED: "אושרה",
  ACTIVE: "פעילה",
  RETURNED: "הוחזר",
  COMPLETED: "הושלמה",
  IN_DISPUTE: "במחלוקת",
  NON_RETURN_PENDING: "אי-החזרה בבדיקה",
  NON_RETURN_CONFIRMED: "אי-החזרה מאושרת",
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
    "RETURNED",
    "IN_DISPUTE",
    "NON_RETURN_PENDING",
    "NON_RETURN_CONFIRMED",
    "COMPLETED",
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
              "brand-chip text-xs shrink-0",
              isActive
                ? "brand-chip-active"
                : "brand-chip-idle"
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
