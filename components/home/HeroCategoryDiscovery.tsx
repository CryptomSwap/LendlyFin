import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";

/**
 * Desktop-only category discovery panel for the hero LEFT column.
 * Title, subtitle, category grid, browse-all. Renders only on md+.
 */
export function HeroCategoryDiscovery() {
  return (
    <div
      className="flex flex-col w-full min-h-0"
      aria-label="גלה לפי קטגוריה"
    >
      <div className="rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 shadow-soft p-5 flex flex-col min-h-0">
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-1">
          גלה לפי קטגוריה
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          בחרו קטגוריה וחפשו ציוד להשכרה בקרבתכם
        </p>
        <div className="grid grid-cols-2 gap-2 flex-1 content-start">
          {CATEGORY_LIST.map((c) => (
            <Link
              key={c.slug}
              href={`/search?category=${encodeURIComponent(c.slug)}`}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border/50 transition-colors duration-200"
            >
              {c.labelHe}
            </Link>
          ))}
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-1.5 mt-5 pt-5 border-t border-border/40 text-sm font-semibold text-primary hover:text-primary/90 hover:underline transition-colors"
        >
          כל ההשכרות
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
