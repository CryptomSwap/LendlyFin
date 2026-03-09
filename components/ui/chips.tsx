import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  selected?: boolean;
  /** "default" = filter/list style; "category" = hero gradient pill */
  variant?: "default" | "category";
  className?: string;
}

export default function Chip({
  label,
  selected,
  variant = "default",
  className,
}: ChipProps) {
  if (variant === "category") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full",
          "bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] border border-[var(--mint-accent)]/25",
          "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
          "hover:bg-[var(--mint-accent)]/25 hover:border-[var(--mint-accent)]/40 hover:shadow-[0_2px_12px_rgba(47,191,159,0.15)]",
          "transition-all duration-200",
          selected && "ring-2 ring-[var(--mint-accent)] ring-offset-2 ring-offset-background",
          className
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 text-sm rounded-full border transition-colors",
        selected
          ? "bg-[var(--mint-accent)] text-white border-[var(--mint-accent)]"
          : "bg-card text-foreground border-border hover:border-[var(--mint-accent)]/50 hover:bg-[var(--mint-accent)]/5",
        className
      )}
    >
      {label}
    </span>
  );
}
