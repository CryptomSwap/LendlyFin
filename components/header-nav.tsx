"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Same destinations as bottom nav; used in header on desktop (md+). */
const ITEMS = [
  { href: "/search", label: "חיפוש" },
  { href: "/bookings", label: "הזמנות" },
  { href: "/owner", label: "ניהול הזמנות" },
  { href: "/help", label: "עזרה" },
  { href: "/profile", label: "פרופיל" },
] as const;

export default function HeaderNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const me = data.user ?? data;
        setIsAdmin(Boolean(me?.isAdmin));
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <nav
      className="hidden md:flex items-center gap-4"
      aria-label="ניווט ראשי"
    >
      {isAdmin && (
        <Link
          href="/admin/metrics"
          className={cn(
            "text-sm font-medium rounded-md px-2.5 py-1.5 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            pathname.startsWith("/admin")
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
        >
          לוח ניהול
        </Link>
      )}
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium rounded-md px-2.5 py-1.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
