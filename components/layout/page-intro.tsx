import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageIntroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export function PageIntro({ title, subtitle, className }: PageIntroProps) {
  return (
    <header className={cn("mb-6 md:mb-8", className)}>
      <h1 className="page-title">{title}</h1>
      {subtitle != null && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}
