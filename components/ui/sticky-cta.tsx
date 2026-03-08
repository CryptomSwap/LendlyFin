import { cn } from "@/lib/utils";

export default function StickyCTA({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-16 md:bottom-4 inset-x-0 z-50",
        "max-w-md md:max-w-7xl mx-auto",
        "bg-gradient-to-t from-background via-background/98 to-background/95",
        "border-t border-border",
        "shadow-cta-strip",
        "backdrop-blur-sm",
        "px-4 py-4",
        "min-h-[3rem] flex flex-col justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}
