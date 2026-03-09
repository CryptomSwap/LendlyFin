import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionBlockProps {
  children: ReactNode;
  className?: string;
  /** Accessibility label for the section */
  "aria-label"?: string;
  /** Tighter vertical padding */
  tight?: boolean;
}

export function SectionBlock({
  children,
  className,
  "aria-label": ariaLabel,
  tight = false,
}: SectionBlockProps) {
  return (
    <section
      className={cn(
        tight ? "py-6 md:py-8" : "py-8 md:py-10",
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}
