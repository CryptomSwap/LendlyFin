import {
  ShieldCheck,
  Users,
  Wallet,
  MapPin,
  Calendar,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import {
  HOME_WHY_LENDLY,
  HOME_WHY_LENDLY_HEADING,
} from "@/lib/copy/help-reassurance";

const ICONS: LucideIcon[] = [
  ShieldCheck,
  Users,
  Wallet,
  MapPin,
  Calendar,
  Leaf,
];

/**
 * Homepage "Why Lendly": compact premium benefits section.
 * Strong intro, tight grid, subtle inner grouping. Mint/emerald theme.
 */
export function WhyLendly() {
  return (
    <section
      className="space-y-6 md:space-y-8"
      dir="rtl"
      aria-label={HOME_WHY_LENDLY_HEADING.title}
    >
      {/* Section intro — prominent title + short subtitle */}
      <header className="space-y-1.5">
        <h2 className="section-title text-xl font-semibold text-foreground md:text-2xl">
          {HOME_WHY_LENDLY_HEADING.title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {HOME_WHY_LENDLY_HEADING.subtitle}
        </p>
      </header>

      {/* Benefits grid — no inner box; uses full column width naturally */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-6 md:gap-x-6 md:gap-y-8">
        {HOME_WHY_LENDLY.map((item, i) => {
          const Icon = ICONS[i] ?? Leaf;
          return (
            <div
              key={i}
              className="flex flex-col gap-2 text-right"
              role="listitem"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] shrink-0">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
