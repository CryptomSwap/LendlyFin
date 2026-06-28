export interface SectionBlockProps {
  children: React.ReactNode;
  tight?: boolean;
  className?: string;
  "aria-label"?: string;
}

export default function SectionBlock({
  children,
  tight = false,
  className = "",
  "aria-label": ariaLabel,
}: SectionBlockProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={[tight ? "py-8" : "py-16", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
