import {
  ShieldCheck,
  Users,
  Wallet,
  MapPin,
  Calendar,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { HOME_WHY_LENDLY } from "@/lib/copy/help-reassurance";

const ICONS: LucideIcon[] = [
  ShieldCheck,
  Users,
  Wallet,
  MapPin,
  Calendar,
  Leaf,
];

/**
 * Homepage "Why Lendly": editorial feature grid.
 * grid-cols-2 lg:grid-cols-4 — icon, title, short description. Mint icon color.
 */
export function WhyLendly() {
  return (
    <section
      className="space-y-8 md:space-y-10 pt-2 pb-2"
      dir="rtl"
      aria-label="למה להשתמש בלנדלי"
    >
      <h2 className="section-title text-lg md:text-xl">למה להשתמש בלנדלי</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
        {HOME_WHY_LENDLY.map((item, i) => {
          const Icon = ICONS[i] ?? Leaf;
          return (
            <div
              key={i}
              className="flex flex-col gap-3 text-right"
              role="listitem"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] shrink-0">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
