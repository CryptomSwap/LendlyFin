"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LIST } from "@/lib/constants";
import {
  Camera,
  Wrench,
  Headphones,
  Tent,
  Music,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

type SegmentId = "all" | "media" | "outdoor";

const SEGMENTS: { id: SegmentId; label: string }[] = [
  { id: "all", label: "כל הקטגוריות" },
  { id: "media", label: "צילום ומדיה" },
  { id: "outdoor", label: "ספורט ופנאי" },
];

const MEDIA_SLUGS = ["camera", "dj", "music"];
const OUTDOOR_SLUGS = ["tools", "camping", "sports"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  tools: Wrench,
  dj: Headphones,
  camping: Tent,
  sports: CircleDot,
  music: Music,
};

function getFilteredCategories(segment: SegmentId) {
  if (segment === "media") return CATEGORY_LIST.filter((c) => MEDIA_SLUGS.includes(c.slug));
  if (segment === "outdoor") return CATEGORY_LIST.filter((c) => OUTDOOR_SLUGS.includes(c.slug));
  return CATEGORY_LIST;
}

/**
 * Category discovery. Desktop: hero sidebar (20% width). Mobile: full width below hero. Strong "Browse by category" section with grid and icons.
 */
export function DesktopCategoryDiscovery() {
  const [segment, setSegment] = useState<SegmentId>("all");
  const categories = getFilteredCategories(segment);

  return (
    <div
      className="flex flex-col w-full h-full min-h-0 overflow-hidden home-gradient-bg-subtle"
      aria-label="חפשו לפי קטגוריות"
    >
      <div className="w-full max-w-5xl mx-auto px-6 pt-36 pb-10 flex flex-col min-h-0 flex-1">
        {/* Section hierarchy: title, segment tabs, grid */}
        <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">
          חפשו לפי קטגוריות
        </h2>
        {/* Segment tabs — mint accent, matches search primary */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/60 dark:bg-black/10 p-1.5 mb-6" role="tablist" aria-label="סינון קטגוריות">
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

        {/* Category grid — stacked icon + label, premium minimal style */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 min-w-0 flex-1 content-start"
          role="navigation"
          aria-label="קטגוריות לגלישה"
        >
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug];
            return (
              <Link
                key={c.slug}
                href={`/search?category=${encodeURIComponent(c.slug)}`}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-medium border border-border/80 bg-card/80 text-foreground shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:bg-[var(--mint-accent)]/8 hover:border-[var(--mint-accent)]/25 hover:text-[var(--mint-accent)] transition-all duration-200"
              >
                {Icon ? (
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-[var(--mint-accent)]" aria-hidden />
                ) : null}
                <span className="text-center">{c.labelHe}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
