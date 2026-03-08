"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import AuthHeaderLink from "@/components/auth-header-link";

const NAV_ITEMS = [
  { href: "/search", label: "חיפוש" },
  { href: "/bookings", label: "הזמנות" },
  { href: "/help", label: "עזרה" },
  { href: "/profile", label: "פרופיל" },
] as const;

/**
 * Desktop-only minimal nav overlay on the homepage hero (replaces the hidden header).
 * Logo, nav links, auth — floats over the hero with no white bar.
 */
export function HomeHeroNav() {
  const pathname = usePathname();

  return (
    <div
      className="hidden md:flex absolute top-0 left-0 right-0 z-30 w-full py-4 bg-gradient-to-b from-black/15 via-black/10 to-transparent"
      aria-label="ניווט"
    >
      <div className="w-full px-4 md:px-8 flex justify-between items-center">
        <div className="mt-2 me-4 [&_img]:brightness-0 [&_img]:invert">
          <Logo size={84} linkToHome />
        </div>
        <div className="flex items-center gap-5 md:gap-6">
          <nav className="flex items-center gap-1" aria-label="ניווט ראשי">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium rounded-md px-2.5 py-1.5 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    active
                      ? "text-primary bg-white/25"
                      : "text-white/95 hover:text-white hover:bg-white/20"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 [&_a]:text-white/95 [&_a:hover]:text-white">
            <AuthHeaderLink />
          </div>
        </div>
      </div>
    </div>
  );
}
