import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  /** Optional padding override; default is p-6 */
  padding?: "none" | "sm" | "default" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  default: "p-6",
  lg: "p-6 md:p-8",
};

export function SurfaceCard({
  children,
  className,
  padding = "default",
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-card border border-border/80 shadow-soft",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
