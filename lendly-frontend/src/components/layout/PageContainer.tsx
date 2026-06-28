export interface PageContainerProps {
  children: React.ReactNode;
  width?: "narrow" | "default" | "wide";
  className?: string;
}

const WIDTH_CLASSES = {
  narrow: "mx-auto max-w-2xl px-5",
  default: "mx-auto max-w-[1420px] px-5",
  wide: "mx-auto max-w-[1680px] px-5",
} as const;

export default function PageContainer({
  children,
  width = "default",
  className = "",
}: PageContainerProps) {
  return (
    <div className={[WIDTH_CLASSES[width], "w-full", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
