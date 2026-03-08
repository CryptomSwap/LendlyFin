"use client";

import { Shield, Clock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Trust microcopy row under primary CTA (listing, checkout, booking detail).
 * Reduces friction with short reassurance copy; RTL-safe.
 */
export function TrustCTARow({ className }: { className?: string }) {
  const items = [
    { icon: Shield, text: "פיקדון מוחזר בהתאם למצב הפריט" },
    { icon: Clock, text: "תמיכה זמינה כשצריך" },
    { icon: HelpCircle, text: "שאלות? מרכז העזרה" },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className
      )}
      dir="rtl"
    >
      {items.map(({ icon: Icon, text }) => (
        <span key={text} className="inline-flex items-center gap-1">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{text}</span>
        </span>
      ))}
    </div>
  );
}
