import { Search, CreditCard, PackageCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "חפשו ציוד",
    description: "גלו מודעות לפי קטגוריה, מחיר ומיקום. בחרו פריט ותאריכים.",
  },
  {
    icon: CreditCard,
    title: "הזמינו ושלמו",
    description: "ציינו מספר הזמנה, שלמו ב-Bit. אחרי אימות — תקבלו הוראות איסוף.",
  },
  {
    icon: PackageCheck,
    title: "איסוף והחזרה",
    description: "תאמו עם המלווה, אספו והחזירו. הפיקדון מוחזר בהתאם למצב הפריט.",
  },
] as const;

/**
 * Three-step "how it works": light step row with clear hierarchy.
 * Section title + 3 steps with numbered indicator, icon, larger title, description.
 */
export function HowItWorks() {
  return (
    <div className="space-y-8 md:space-y-10" dir="rtl" aria-label="איך זה עובד">
      <h2 className="section-title text-lg md:text-xl">איך זה עובד</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-start gap-4 text-center sm:text-right"
              role="listitem"
            >
              <div className="flex flex-row items-center gap-3 sm:gap-4">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mint-accent)] text-white text-sm font-bold"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--mint-accent)]/15 text-[var(--mint-accent)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
