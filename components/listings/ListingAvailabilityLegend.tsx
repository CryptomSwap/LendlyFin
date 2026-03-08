"use client";

import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  { key: "available" as const, label: "זמין", className: "bg-muted border border-border" },
  { key: "blocked" as const, label: "חסום (ידני)", className: "bg-amber-100 border border-amber-300 text-amber-900" },
  { key: "booked" as const, label: "תפוס (הזמנה)", className: "bg-primary/15 border border-primary/40 text-primary" },
];

export interface ListingAvailabilityLegendProps {
  className?: string;
}

export default function ListingAvailabilityLegend({ className }: ListingAvailabilityLegendProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3 text-sm text-muted-foreground", className)}
      role="list"
      aria-label="מקרא זמינות"
    >
      {LEGEND_ITEMS.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5" role="listitem">
          <span
            className={cn("h-5 w-5 shrink-0 rounded border", item.className)}
            aria-hidden
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
