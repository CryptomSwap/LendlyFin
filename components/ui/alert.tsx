import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = {
  default: "bg-muted text-foreground border-border",
  success: "bg-success/10 text-success border-success/30 dark:bg-success/20 dark:border-success/40",
  error: "bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:border-destructive/40",
  warning: "bg-warning/10 text-warning border-warning/30 dark:bg-warning/20 dark:border-warning/40",
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role={variant === "error" || variant === "warning" ? "alert" : undefined}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        alertVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
