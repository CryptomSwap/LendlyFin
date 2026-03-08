"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LIST } from "@/lib/constants";
import { ChevronLeft } from "lucide-react";

type SegmentId = "all" | "media" | "outdoor";

const SEGMENTS: { id: SegmentId; label: string }[] = [
  { id: "all", label: "כל הקטגוריות" },
  { id: "media", label: "צילום ומדיה" },
  { id: "outdoor", label: "ספורט ופנאי" },
];

const MEDIA_SLUGS = ["camera", "dj", "music"];
const OUTDOOR_SLUGS = ["tools", "camping", "sports"];

function getFilteredCategories(segment: SegmentId) {
  if (segment === "media") return CATEGORY_LIST.filter((c) => MEDIA_SLUGS.includes(c.slug));
  if (segment === "outdoor") return CATEGORY_LIST.filter((c) => OUTDOOR_SLUGS.includes(c.slug));
  return CATEGORY_LIST;
}

/**
 * Category discovery. Desktop: hero sidebar (20% width). Mobile: full width below hero. Same component; premium hierarchy, mint accents, consistent radius.
 */
export function DesktopCategoryDiscovery() {
  const [segment, setSegment] = useState<SegmentId>("all");
  const categories = getFilteredCategories(segment);

  return (
    <div
      className="flex flex-col w-full h-full min-h-0 overflow-hidden home-gradient-bg-subtle"
      aria-label="גלו לפי קטגוריה"
    >
      <div className="p-5 md:p-6 flex flex-col min-h-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            גלו לפי קטגוריה
          </h2>
          <Link
            href="/search"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-[var(--mint-accent)] hover:text-[var(--mint-accent-hover)] transition-colors"
          >
            גלוש בהכל
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          בחרו קטגוריה וחפשו ציוד להשכרה בקרבתכם
        </p>

        {/* Segment tabs — mint accent, matches search primary */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/60 dark:bg-black/10 p-1.5 mb-4" role="tablist" aria-label="סינון קטגוריות">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={segment === s.id}
              onClick={() => setSegment(s.id)}
              className={`
                rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint-accent)] focus-visible:ring-offset-2
                ${segment === s.id
                  ? "bg-[var(--mint-accent)]/15 text-[var(--mint-accent)] border border-[var(--mint-accent)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--mint-accent)]/10 border border-transparent"
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Category pills — mint, consistent rounded-xl with search */}
        <div className="flex flex-wrap gap-2 flex-1 content-start min-h-0">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/search?category=${encodeURIComponent(c.slug)}`}
              className="
                inline-flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium
                bg-[var(--mint-accent)]/10 text-[var(--mint-accent)] border border-[var(--mint-accent)]/25
                hover:bg-[var(--mint-accent)]/20 hover:border-[var(--mint-accent)]/40
                transition-all duration-200
              "
            >
              {c.labelHe}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
