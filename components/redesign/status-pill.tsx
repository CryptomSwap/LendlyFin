export type RedesignStatusVariant = "success" | "warning" | "danger" | "muted" | "brand";

export interface RedesignStatusPillProps {
  children: React.ReactNode;
  variant?: RedesignStatusVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<RedesignStatusVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-600",
  muted: "bg-black/8 text-[#888888]",
  brand: "bg-[#1A8C6A]/15 text-[#1A8C6A]",
};

export function RedesignStatusPill({
  children,
  variant = "muted",
  className = "",
}: RedesignStatusPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-bold",
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
