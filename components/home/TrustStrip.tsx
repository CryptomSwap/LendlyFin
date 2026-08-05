import { CheckCircle2, Shield, Users } from "lucide-react";

const PILLARS = [
  {
    icon: CheckCircle2,
    title: "מאומתים",
    description: "מלווים עוברים אימות זהות. רואים בכל מודעה מי מאומת.",
  },
  {
    icon: Shield,
    title: "פיקדון",
    description: "פיקדון מוחזר בהתאם למצב הפריט — שקוף ומגן על שני הצדדים.",
  },
  {
    icon: Users,
    title: "קהילה",
    description: "ביקורות, הודעות ותמיכה — כלים ברורים להשכרה בין אנשים.",
  },
] as const;

/**
 * Three-pillar trust strip: light horizontal row, no heavy cards.
 * Icon + title + short text; mint/primary icon color.
 */
export function TrustStrip() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8"
      dir="rtl"
      role="list"
      aria-label="אמון ובטיחות"
    >
      {PILLARS.map((p, i) => {
        const Icon = p.icon;
        return (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-start gap-3 text-center sm:text-right"
            role="listitem"
          >
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mint-accent)]/15 text-[var(--mint-accent)]">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground mb-0.5">{p.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
