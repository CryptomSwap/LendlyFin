"use client";

import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder for ListingCard during search/home load.
 * Matches listing card layout: image, title, metadata line, price row.
 */
export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-border bg-card shadow-card w-full flex flex-col",
        className
      )}
      dir="rtl"
    >
      <div className="w-full aspect-[4/3] min-h-[140px] bg-muted animate-pulse shrink-0" />
      <div className="flex flex-col items-start text-right px-4 pt-3 pb-4 gap-1.5">
        <div className="h-5 w-4/5 max-w-[240px] rounded bg-muted animate-pulse" />
        <div className="h-3.5 w-1/2 max-w-[140px] rounded bg-muted animate-pulse" />
        <div className="pt-2 mt-0.5 border-t border-border w-full flex items-baseline gap-1">
          <div className="h-6 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-8 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
