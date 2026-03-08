import Link from "next/link";
import Chip from "@/components/ui/chips";
import { CATEGORY_LIST } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";

/**
 * Desktop-only category discovery side panel for the top fold.
 * Renders a card with title, subtitle, category chips, and "browse all" link.
 * Use inside HeroSection; parent should hide on mobile (e.g. hidden md:block).
 */
export function CategoryDiscoveryPanel() {
  return (
    <div
      className="hidden md:flex flex-col h-full rounded-xl border border-border bg-card shadow-soft p-5"
      aria-label="גלה לפי קטגוריה"
    >
      <h2 className="text-base font-semibold text-foreground mb-1">
        גלה לפי קטגוריה
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        בחרו קטגוריה וחפשו ציוד להשכרה בקרבתכם
      </p>
      <div className="flex flex-wrap gap-2">
        {CATEGORY_LIST.map((c) => (
          <Link
            key={c.slug}
            href={`/search?category=${encodeURIComponent(c.slug)}`}
            className="flex-shrink-0"
          >
            <Chip label={c.labelHe} variant="category" />
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          כל ההשכרות
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
