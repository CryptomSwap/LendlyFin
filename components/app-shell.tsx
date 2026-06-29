"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import BottomNav from "@/components/bottom-nav";
import AuthHeaderLink from "@/components/auth-header-link";
import HeaderNav from "@/components/header-nav";
import DevImpersonationSwitcher from "@/components/dev-impersonation-switcher";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const isSearchPage = pathname === "/search";

  return (
    <div className="min-h-screen bg-background flex justify-center md:block" dir="rtl">
      {/* QA / profile selector: fixed top-left (physical left in RTL) */}
      <div className="fixed top-0 left-0 z-50 p-2 md:p-3">
        <DevImpersonationSwitcher />
      </div>
      <div
        className={cn(
          "w-full min-h-screen pb-24 md:pb-8",
          isHomePage ? "max-w-none bg-white" : "max-w-md md:max-w-none bg-card md:bg-transparent"
        )}
      >
        {/* Header: hidden on /home (marketing page has its own navbar); /search = overlay; other = sticky card header */}
        {!isHomePage && (
        <header
          className={
            isSearchPage
                ? "absolute top-0 left-0 right-0 z-40 min-h-[3.25rem] flex flex-col gap-2 shrink-0 bg-gradient-to-b from-black/25 to-transparent border-0 shadow-none text-white [&_a]:text-white [&_a:hover]:text-white/90 [&_span]:text-white [&_img]:brightness-0 [&_img]:invert"
                : "sticky top-0 z-40 min-h-[3.25rem] flex flex-col gap-2 shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 border-b border-white/10 shadow-soft text-white [&_a]:text-white [&_a:hover]:text-white/90 [&_span]:text-white [&_img]:brightness-0 [&_img]:invert"
          }
          aria-label="כותרת"
        >
          <div className={cn(
            "w-full max-w-md md:max-w-7xl md:mx-auto px-4 md:px-8",
            "py-3 md:py-4"
          )}>
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <AuthHeaderLink />
              {isSearchPage && <span className="flex-1 min-h-[2.25rem]" aria-hidden />}
              {!isSearchPage && <Logo size={36} linkToHome />}
              <HeaderNav />
            </div>
          </div>
        </header>
        )}
        <main
          className={cn(
            "flex-1 min-w-0 md:overflow-visible",
            isHomePage && "pt-0 md:pt-0 overflow-x-hidden",
            isSearchPage && "pt-0 px-0 overflow-x-hidden",
            !isHomePage && !isSearchPage && "px-4 md:px-8 pt-5 md:pt-8"
          )}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
