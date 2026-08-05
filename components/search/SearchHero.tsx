"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SearchHeroProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Search hero — cream redesign surface matching homepage marketing language.
 */
export function SearchHero({ title, subtitle, children }: SearchHeroProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden bg-[#F7F6F3] text-black",
        "min-h-[280px] md:min-h-[320px]"
      )}
      dir="rtl"
      aria-label="חיפוש וגילוי"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1420px] flex-col justify-center px-5 py-10 md:py-14">
        <div className="flex w-full max-w-3xl flex-col items-start gap-5 text-right">
          <h1 className="m-0 font-sans text-[32px] font-black leading-tight tracking-[-1px] text-black md:text-[48px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="m-0 max-w-xl font-assistant text-[16px] leading-relaxed text-[#888888] md:text-[18px]">
              {subtitle}
            </p>
          ) : null}
          <div className={cn("flex w-full flex-col gap-y-5", subtitle ? "mt-1" : "")}>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
