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
      className="fixed bottom-0 inset-x-0 z-50 border-t border-black/10 bg-white md:hidden"
      aria-label="ניווט ראשי"
    >
      <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-1 px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 min-w-0 rounded-full px-3 py-2.5 text-center font-assistant text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A8C6A]/30",
                active
                  ? "bg-[#1A8C6A] font-sans font-bold text-white"
                  : "text-[#888888] hover:bg-black/5 hover:text-black"
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
