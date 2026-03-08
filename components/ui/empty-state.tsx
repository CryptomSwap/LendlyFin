"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
  variant?: "full" | "inline";
  className?: string;
}

export function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  onCtaClick,
  icon,
  variant = "full",
  className,
}: EmptyStateProps) {
  const IconComponent = icon ?? (
    <Package className="h-12 w-12 text-primary" aria-hidden />
  );

  if (variant === "inline") {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-xl border shadow-soft p-8 text-center space-y-4",
        className
      )}
    >
      <div className="flex justify-center">{IconComponent}</div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {subtitle}
          </p>
        )}
      </div>
      {ctaLabel && (ctaHref || onCtaClick) && (
        <>
          {ctaHref ? (
            <a href={ctaHref} className="inline-block">
              <Button variant="gradient" size="lg">
                {ctaLabel}
              </Button>
            </a>
          ) : (
            <Button variant="gradient" size="lg" onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
