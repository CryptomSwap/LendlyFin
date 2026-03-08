"use client";

import { cn } from "@/lib/utils";
import type { TrustBadge } from "@/lib/trust/badges";

export interface TrustBadgesProps {
  badges: TrustBadge[];
  /** "compact" for listing cards; "default" for detail/profile */
  size?: "compact" | "default";
  className?: string;
}

export default function TrustBadges({
  badges,
  size = "default",
  className,
}: TrustBadgesProps) {
  if (badges.length === 0) return null;

  const isCompact = size === "compact";

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-1.5 justify-end list-none p-0 m-0",
        className
      )}
      aria-label="תגי אמון"
    >
      {badges.map((badge) => (
        <li key={badge.key}>
          <span
            title={badge.tooltip}
            className={cn(
              "inline-flex items-center rounded-full font-medium bg-[var(--mint-accent)]/10 text-[var(--mint-accent)] border border-[var(--mint-accent)]/25",
              isCompact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
            )}
          >
            {badge.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
