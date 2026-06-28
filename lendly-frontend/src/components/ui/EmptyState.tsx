import Link from "next/link";
import { Package } from "lucide-react";
import Button from "@/components/ui/Button";

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[8px] border border-black/10 bg-white p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A8C6A]/10 text-[#1A8C6A]">
        {icon ?? <Package className="h-6 w-6" aria-hidden />}
      </div>

      <h3 className="font-sans text-[18px] font-black text-black">{title}</h3>

      {subtitle ? (
        <p className="max-w-xs font-assistant text-[14px] leading-relaxed text-[#888888]">
          {subtitle}
        </p>
      ) : null}

      {ctaLabel && ctaHref ? (
        <Button variant="primary" size="md" asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
