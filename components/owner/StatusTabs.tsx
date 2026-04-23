"use client";

import { cn } from "@/lib/utils";

export type ListingFilterType = "all" | "active" | "pending" | "paused";

const filterLabels: Record<ListingFilterType, string> = {
  all: "הכל",
  active: "פעילים",
  pending: "ממתינים",
  paused: "מושהים",
};

export interface StatusTabsProps {
  activeFilter: ListingFilterType;
  onFilterChange: (filter: ListingFilterType) => void;
  counts: Record<ListingFilterType, number>;
}

export function StatusTabs({ activeFilter, onFilterChange, counts }: StatusTabsProps) {
  const filters: ListingFilterType[] = ["all", "active", "pending", "paused"];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
      dir="rtl"
      role="tablist"
      aria-label="סינון לפי סטטוס"
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter;
        const count = counts[filter];
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
            {filterLabels[filter]}
            {count > 0 && (
              <span className={cn("mr-0.5 text-[10px]", isActive ? "opacity-90" : "opacity-70")}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
