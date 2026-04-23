"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/metrics", label: "מדדים" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/listings", label: "מודעות" },
  { href: "/admin/bookings", label: "הזמנות" },
  { href: "/admin/disputes", label: "מחלוקות" },
  { href: "/admin/kyc", label: "אימות זהות" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2" dir="rtl">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "brand-chip",
            pathname?.startsWith(href) ? "brand-chip-active" : "brand-chip-idle"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
