import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingBlockProps {
  /** Message shown under the spinner */
  message?: string;
  /** "inline" = minimal row; "full" = centered block with padding (e.g. initial load) */
  variant?: "inline" | "full";
  className?: string;
}

/**
 * Shared loading state: spinner + message.
 * Use for initial loads, section loads, and inline "טוען..." replacement.
 */
export function LoadingBlock({
  message = "טוען...",
  variant = "inline",
  className,
}: LoadingBlockProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        variant === "full" && "py-12 px-4",
        variant === "inline" && "py-4",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
      <span className="text-sm">{message}</span>
    </div>
  );
}
