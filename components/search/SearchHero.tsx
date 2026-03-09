"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HeroExperienceBackground } from "@/components/home/HeroExperienceBackground";

export interface SearchHeroProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** One editorial column: max width, anchored right, Hebrew-first */
const BANNER_COLUMN_MAX = "max-w-[34rem]";

/**
 * Hero: mobile = full-width image + overlay + stacked content; desktop = split image + banner.
 */
export function SearchHero({ title, subtitle, children }: SearchHeroProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-b-2xl text-white",
        "min-h-[320px] max-h-[420px] md:min-h-[280px] md:max-h-none"
      )}
      dir="ltr"
      aria-label="חיפוש וגילוי"
    >
      {/* ——— Mobile: full-width background image ——— */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-2xl opacity-95 md:left-0 md:right-auto md:w-[60%] md:rounded-bl-2xl md:rounded-br-none [&_img]:object-cover [&_img]:object-left">
        <HeroExperienceBackground />
      </div>

      {/* ——— Mobile: full-width semi-transparent navy overlay ——— */}
      <div
        className="absolute inset-0 z-[1] rounded-b-2xl bg-[#0f2747]/80 pointer-events-none md:hidden"
        aria-hidden
      />

      {/* ——— Desktop: solid banner (right 40%) + gradient blend ——— */}
      <div
        className="absolute inset-y-0 right-0 w-[40%] z-[1] rounded-br-2xl bg-[#0f2747] pointer-events-none hidden md:block"
        aria-hidden
      />
      <div
        className="absolute inset-y-0 left-[45%] w-[22%] z-[2] pointer-events-none hidden md:block"
        style={{
          background: `linear-gradient(90deg, rgba(15,39,71,0) 0%, rgba(15,39,71,0.04) 12%, rgba(15,39,71,0.12) 28%, rgba(15,39,71,0.26) 45%, rgba(15,39,71,0.44) 62%, rgba(15,39,71,0.62) 78%, rgba(15,39,71,0.82) 92%, rgba(15,39,71,0.95) 100%)`,
        }}
        aria-hidden
      />

      {/* ——— Content: stacked, text-right; mobile = centered block, desktop = right column ——— */}
      <div
        className={cn(
          "relative z-10 flex flex-col justify-center min-h-[320px] max-h-[420px] md:min-h-[280px] md:max-h-none",
          "px-4 pt-10 pb-8 md:pt-16 md:pb-20 md:pr-8 md:pl-0"
        )}
      >
        <div
          className={cn(
            BANNER_COLUMN_MAX,
            "w-full flex flex-col text-right",
            "ml-0 md:ml-auto"
          )}
          dir="rtl"
        >
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0 leading-tight">
            {title}
          </h1>
          {/* Subtitle: mt-2 on mobile, spacing preserved on desktop (only when provided) */}
          {subtitle ? (
            <p className="text-base md:text-lg text-white/80 font-normal max-w-[28rem] leading-relaxed m-0 mt-2 md:mt-1.5">
              {subtitle}
            </p>
          ) : null}
          {/* Search + chips: mt-4 on mobile, larger gap on desktop */}
          <div className={cn("flex flex-col gap-y-6", subtitle ? "mt-4 md:mt-10" : "mt-4 md:mt-6")}>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
