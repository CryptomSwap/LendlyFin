"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/bottom-nav";
import DevImpersonationSwitcher from "@/components/dev-impersonation-switcher";
import MarketingNavbar from "@/components/home/MarketingNavbar";
import RedesignFooter from "@/components/layout/redesign-footer";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home" || pathname === "/";
  const isSearchPage = pathname === "/search";

  return (
    <div className="relative min-h-screen bg-white flex flex-col" dir="rtl">
      <div className="fixed top-0 left-0 z-[60] p-2 md:p-3">
        <DevImpersonationSwitcher />
      </div>

      <div
        className={
          isHomePage
            ? "pointer-events-none absolute inset-x-0 top-0 z-50 px-4 pt-4"
            : "relative z-50"
        }
      >
        <div className={isHomePage ? "pointer-events-auto" : undefined}>
          <MarketingNavbar floating={isHomePage} />
        </div>
      </div>

      <main
        className={cn(
          "flex-1 min-w-0 w-full bg-white pb-24 md:pb-8",
          isHomePage && "overflow-visible",
          isSearchPage && "overflow-x-hidden"
        )}
      >
        {children}
      </main>

      <RedesignFooter />
      <BottomNav />
    </div>
  );
}
