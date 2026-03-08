"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/listing-card";
import ListingsMap from "@/components/listings-map";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { Alert } from "@/components/ui/alert";
import { ListingCardSkeleton } from "@/components/ui/listing-card-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chip from "@/components/ui/chips";
import { CATEGORY_LIST } from "@/lib/constants";
import { getListingTrustBadges } from "@/lib/trust/badges";
import { cn } from "@/lib/utils";
import { LayoutList, Map, Search, SearchX } from "lucide-react";

type SearchListing = {
  id: string;
  title: string;
  pricePerDay: number;
  city: string;
  category: string;
  lat: number | null;
  lng: number | null;
  images: { url: string }[];
  owner?: { id: string; kycStatus?: string | null; phoneNumber?: string | null } | null;
  completedBookingsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
};

const inputBase = "input-base";

/** Max price slider: 0 = no limit, else 50–2000 NIS step 50 */
const MAX_PRICE_SLIDER_CAP = 2000;
const MAX_PRICE_STEP = 50;

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [min, setMin] = useState(""); // no min in UI; kept for URL/clear compatibility
  const [max, setMax] = useState(params.get("max") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");
  const [view, setView] = useState((params.get("view") ?? "list") as "list" | "map");

  const maxSliderValue = max !== "" && Number.isFinite(Number(max)) ? Math.min(MAX_PRICE_SLIDER_CAP, Math.max(0, Number(max))) : 0;

  const [items, setItems] = useState<SearchListing[]>([]);
  const [page, setPage] = useState(Number(params.get("page") ?? 1));
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestReq = useRef(0);

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCategory(params.get("category") ?? "");
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
    setSort(params.get("sort") ?? "newest");
    setView((params.get("view") ?? "list") as "list" | "map");
    setPage(Number(params.get("page") ?? 1));
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchResults(page, true);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, min, max, sort, page]);

  async function fetchResults(
    p: number,
    reset = false,
    overrides?: { q?: string; category?: string; min?: string; max?: string; sort?: string }
  ) {
    const requestId = ++latestReq.current;
    setLoading(true);
    setError(null);
    if (reset) setHasMore(true);

    const qVal = overrides?.q ?? q;
    const catVal = overrides?.category ?? category;
    const minVal = overrides?.min ?? min;
    const maxVal = overrides?.max ?? max;
    const sortVal = overrides?.sort ?? sort;

    const qs = new URLSearchParams({
      q: qVal,
      page: String(p),
      ...(catVal && { category: catVal }),
      ...(sortVal && { sort: sortVal }),
    });
    if (minVal !== "") qs.set("min", minVal);
    if (maxVal !== "") qs.set("max", maxVal);

    let data: any;
    try {
      const res = await fetch(`/api/listings/search?${qs.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Search API failed (${res.status}): ${text}`);
      }
      data = await res.json();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      if (reset) setItems([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    if (requestId !== latestReq.current) return;

    const nextItems: SearchListing[] = Array.isArray(data.items) ? data.items : [];
    setItems((prev) => (reset ? nextItems : [...prev, ...nextItems]));
    setHasMore(Boolean(data.hasMore));
    setPage(p);
    setLoading(false);

    if (reset) {
      const urlQs = new URLSearchParams(qs);
      urlQs.set("view", view);
      const nextUrl = `/search?${urlQs.toString()}`;
      const currentUrl = `/search?${params.toString()}`;
      if (nextUrl !== currentUrl) router.replace(nextUrl);
    }
  }

  const showEmpty = !loading && !error && items.length === 0;

  const syncViewToUrl = (newView: "list" | "map") => {
    const qs = new URLSearchParams(params.toString());
    qs.set("view", newView);
    router.replace(`/search?${qs.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search bar — prominent */}
      <section aria-label="חיפוש">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="חפש פריט... ציוד, כלים, מצלמות"
            className={cn(inputBase, "ps-10 rounded-xl py-3 shadow-soft")}
            aria-label="מילות חיפוש"
          />
        </div>
      </section>

      {/* Category chips — gradient pills, aligned with home */}
      <section aria-label="קטגוריות">
        <h2 className="section-title mb-2">קטגוריות</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          <Link href="/search" className="flex-shrink-0">
            <Chip label="הכל" variant="category" selected={!category} />
          </Link>
          {CATEGORY_LIST.map((c) => (
            <Link
              key={c.slug}
              href={`/search?category=${encodeURIComponent(c.slug)}`}
              className="flex-shrink-0"
            >
              <Chip label={c.labelHe} variant="category" selected={category === c.slug} />
            </Link>
          ))}
        </div>
      </section>

      {/* Filters card — compact */}
      <section aria-label="סינון ומיון">
      <Card className="py-3 px-4 shadow-soft gap-1">
        <CardHeader className="py-0 pb-1 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-xs font-semibold">סינון ומיון</CardTitle>
          {(q || category || min || max || sort !== "newest") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs h-7 px-2"
              onClick={() => {
                setQ("");
                setCategory("");
                setMin("");
                setMax("");
                setSort("newest");
                setPage(1);
                fetchResults(1, true, { q: "", category: "", min: "", max: "", sort: "newest" });
              }}
            >
              נקה סינון
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">קטגוריה</label>
              <select
                value={category}
                onChange={(e) => {
                  setPage(1);
                  setCategory(e.target.value);
                }}
                className={cn(inputBase, "py-2 text-sm")}
              >
                <option value="">כל הקטגוריות</option>
                {CATEGORY_LIST.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.labelHe}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">מיון</label>
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className={cn(inputBase, "py-2 text-sm")}
              >
                <option value="newest">הכי חדשים</option>
                <option value="price">מחיר נמוך</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-0.5">מחיר מקס׳ (₪/יום)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={MAX_PRICE_SLIDER_CAP}
                step={MAX_PRICE_STEP}
                value={maxSliderValue}
                onChange={(e) => {
                  setPage(1);
                  const v = Number(e.target.value);
                  setMax(v === 0 ? "" : String(v));
                }}
                className="flex-1 h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                aria-valuemin={0}
                aria-valuemax={MAX_PRICE_SLIDER_CAP}
                aria-valuenow={maxSliderValue}
                aria-valuetext={maxSliderValue === 0 ? "ללא הגבלה" : `עד ${maxSliderValue} ₪`}
              />
              <span className="text-xs font-medium text-foreground tabular-nums w-16 shrink-0 text-end">
                {maxSliderValue === 0 ? "ללא הגבלה" : `עד ₪${maxSliderValue}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      </section>

      {/* View toggle — list / map (sync to URL) */}
      <div className="flex items-center justify-between gap-4">
        <span className="section-title">תצוגה</span>
        <div className="flex rounded-xl border border-input overflow-hidden bg-muted/30">
          <button
            type="button"
            onClick={() => {
              setView("list");
              syncViewToUrl("list");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-pressed={view === "list"}
          >
            <LayoutList className="h-4 w-4" aria-hidden />
            רשימה
          </button>
          <button
            type="button"
            onClick={() => {
              setView("map");
              syncViewToUrl("map");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
              view === "map"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-pressed={view === "map"}
          >
            <Map className="h-4 w-4" aria-hidden />
            מפה
          </button>
        </div>
      </div>

      {/* Error + retry */}
      {error && (
        <Alert variant="error" className="break-words">
          <span className="font-medium">שגיאה בחיפוש</span>
          <p className="mt-1">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void fetchResults(1, true)}
          >
            נסה שוב
          </Button>
        </Alert>
      )}

      {/* Loading skeletons — list view (grid to match results) */}
      {view === "list" && loading && items.length === 0 && (
        <section aria-label="טוען תוצאות">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — Search icon, clearer copy, CTA to show all */}
      {showEmpty && (
        <EmptyState
          icon={<SearchX className="h-12 w-12 text-muted-foreground" aria-hidden />}
          title="אין תוצאות לחיפוש זה"
          subtitle="נסו מילים אחרות או שנו סינון. או הציגו את כל המודעות."
          ctaLabel="הצגו את כל המודעות"
          ctaHref="/search"
          variant="full"
        />
      )}

      {/* Results — list view with grid and section hierarchy */}
      {view === "list" && items.length > 0 && (
        <section aria-label="תוצאות חיפוש">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="section-title m-0">תוצאות</h2>
            <p className="text-sm text-muted-foreground m-0">
              {items.length} {items.length === 1 ? "פריט" : "פריטים"}
            </p>
          </div>
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", loading && "opacity-70 pointer-events-none")}>
            {items.map((item) => (
              <ListingCard
                key={item.id}
                title={item.title}
                pricePerDay={item.pricePerDay}
                location={item.city}
                href={`/listing/${item.id}`}
                imageUrl={item.images?.[0]?.url}
                category={item.category}
                trustBadges={getListingTrustBadges({
                  kycStatus: item.owner?.kycStatus ?? null,
                  phoneNumber: item.owner?.phoneNumber ?? null,
                  completedBookingsCount: item.completedBookingsCount ?? 0,
                  reviewsCount: item.reviewsCount ?? 0,
                  averageRating: item.averageRating ?? 0,
                })}
              />
            ))}
          </div>
          {loading && items.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" aria-live="polite">
              טוען עוד...
            </p>
          )}
          {hasMore && !loading && (
            <div className="pt-6">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => void fetchResults(page + 1, false)}
              >
                טען עוד
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Map view */}
      {view === "map" && !showEmpty && (
        <section className={cn(loading && "opacity-70")}>
          <ListingsMap items={items} />
          {loading && (
            <div className="py-3 flex justify-center">
              <LoadingBlock message="טוען..." variant="inline" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
