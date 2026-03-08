"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/search", label: "חיפוש" },
  { href: "/bookings", label: "הזמנות" },
  { href: "/help", label: "עזרה" },
  { href: "/profile", label: "פרופיל" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border shadow-cta-strip md:hidden"
      aria-label="ניווט ראשי"
    >
      <div className="max-w-md mx-auto flex justify-between items-center gap-1 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] rounded-t-xl">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 min-w-0 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
