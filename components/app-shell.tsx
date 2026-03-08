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

  return (
    <div className="min-h-screen bg-background flex justify-center md:block" dir="rtl">
      {/* QA / profile selector: fixed top-left (physical left in RTL) */}
      <div className="fixed top-0 left-0 z-50 p-2 md:p-3">
        <DevImpersonationSwitcher />
      </div>
      <div className="w-full max-w-md md:max-w-none bg-card md:bg-transparent min-h-screen pb-24 md:pb-8">
        {/* Header: on /home desktop we hide it; on /home mobile we overlay (no logo — logo is in hero above headline). Other pages: normal sticky header. */}
        <header
          className={
            isHomePage
              ? "absolute top-0 left-0 right-0 z-40 min-h-[3.25rem] flex flex-col gap-2 shrink-0 md:hidden bg-gradient-to-b from-black/20 to-transparent border-0 shadow-none text-white [&_a]:text-white [&_a:hover]:text-white/90 [&_span]:text-white [&_img]:brightness-0 [&_img]:invert"
              : `sticky top-0 z-40 bg-card border-b border-border shadow-soft min-h-[3.25rem] flex flex-col gap-2 shrink-0`
          }
          aria-label="כותרת"
        >
          <div className={cn("w-full max-w-md md:max-w-7xl md:mx-auto px-4 md:px-8", isHomePage ? "pt-4 pb-3 md:py-4" : "py-3 md:py-4")}>
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <AuthHeaderLink />
              {!isHomePage && <Logo size={36} linkToHome />}
              {isHomePage && <span className="flex-1 min-h-[2rem]" aria-hidden />}
              <HeaderNav />
            </div>
          </div>
        </header>
        <main
          className={`px-4 md:px-8 flex-1 min-w-0 ${isHomePage ? "pt-0 md:pt-0 overflow-x-hidden" : "pt-5 md:pt-8"} md:overflow-visible`}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
