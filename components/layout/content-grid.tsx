import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContentGridProps {
  children: ReactNode;
  className?: string;
  /** Number of columns on desktop (default 1) */
  cols?: 1 | 2 | 3;
}

const colsMap = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export function ContentGrid({
  children,
  className,
  cols = 1,
}: ContentGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:gap-8",
        colsMap[cols],
        className
      )}
    >
      {children}
    </div>
  );
}
