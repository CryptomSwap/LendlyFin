export interface SurfaceCardProps {
  children: React.ReactNode;
  padding?: "sm" | "default" | "lg";
  className?: string;
}

const PADDING_CLASSES = {
  sm: "p-4",
  default: "p-6",
  lg: "p-8",
} as const;

export default function SurfaceCard({
  children,
  padding = "default",
  className = "",
}: SurfaceCardProps) {
  return (
    <div
      className={[
        "rounded-[8px] border border-black/10 bg-white",
        PADDING_CLASSES[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
