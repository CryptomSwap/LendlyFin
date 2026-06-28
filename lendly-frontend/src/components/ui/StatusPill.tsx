export type StatusVariant = "success" | "warning" | "danger" | "muted" | "brand";

export interface StatusPillProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-600",
  muted: "bg-black/8 text-[#888888]",
  brand: "bg-[#1A8C6A]/15 text-[#1A8C6A]",
};

export default function StatusPill({
  children,
  variant = "muted",
  className = "",
}: StatusPillProps) {
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
