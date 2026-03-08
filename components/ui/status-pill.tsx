"use client";

import { cn } from "@/lib/utils";

type StatusPillVariant = "primary" | "success" | "warning" | "danger" | "muted";

const variantStyles: Record<
  StatusPillVariant,
  string
> = {
  primary:
    "bg-primary text-primary-foreground",
  success:
    "bg-success text-success-foreground",
  warning:
    "bg-warning text-warning-foreground",
  danger:
    "bg-destructive text-white",
  muted:
    "bg-muted text-muted-foreground",
};

interface StatusPillProps {
  children: React.ReactNode;
  variant?: StatusPillVariant;
  className?: string;
}

export function StatusPill({
  children,
  variant = "primary",
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
