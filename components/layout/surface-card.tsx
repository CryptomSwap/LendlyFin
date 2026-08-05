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
  lg: "p-8",
};

export function SurfaceCard({
  children,
  className,
  padding = "default",
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-black/10 bg-white",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
